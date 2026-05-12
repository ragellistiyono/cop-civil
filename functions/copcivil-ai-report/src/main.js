import { Client, Databases, ID, Query } from 'node-appwrite';

/**
 * Copcivil AI Report — Security Analytics via OpenRouter
 *
 * Routes:
 *   POST /generate  — On-demand report (admin-triggered)
 *   POST /periodic  — Scheduled periodic report (CRON)
 */

function initClient() {
  return new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
}

function parseBody(req) {
  if (!req.body || req.body === '') return {};
  try {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return {};
  }
}

const DB_ID = () => process.env.COPCIVIL_DATABASE_ID;
const INCIDENTS_ID = () => process.env.COPCIVIL_COLLECTION_INCIDENTS;
const REPORTS_ID = () => process.env.COPCIVIL_COLLECTION_AI_REPORTS;
const CONFIG_ID = () => process.env.COPCIVIL_COLLECTION_SECURITY_CONFIG;
const OPENROUTER_API_KEY = () => process.env.OPENROUTER_API_KEY;

async function getConfig(databases, key) {
  try {
    const docs = await databases.listDocuments(DB_ID(), CONFIG_ID(), [
      Query.equal('key', key),
      Query.limit(1),
    ]);
    return docs.documents.length > 0 ? docs.documents[0].value : null;
  } catch {
    return null;
  }
}

async function checkRateLimit(databases, log) {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const recent = await databases.listDocuments(DB_ID(), REPORTS_ID(), [
    Query.greaterThan('generated_at', fiveMinAgo),
    Query.limit(1),
  ]);
  if (recent.total > 0) {
    log('[copcivil-ai-report] Rate limited — report generated within last 5 minutes.');
    return true;
  }
  return false;
}

async function fetchIncidents(databases, periodStart, periodEnd) {
  const allIncidents = [];
  let offset = 0;
  const batchSize = 100;

  while (true) {
    const batch = await databases.listDocuments(DB_ID(), INCIDENTS_ID(), [
      Query.greaterThanEqual('timestamp', periodStart),
      Query.lessThanEqual('timestamp', periodEnd),
      Query.limit(batchSize),
      Query.offset(offset),
      Query.orderDesc('timestamp'),
    ]);

    allIncidents.push(...batch.documents);

    if (batch.documents.length < batchSize) break;
    offset += batchSize;
    if (offset > 1000) break;
  }

  return allIncidents;
}

async function callOpenRouter(model, systemPrompt, userPrompt, log) {
  const apiKey = OPENROUTER_API_KEY();
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  log(`[copcivil-ai-report] Calling OpenRouter with model: ${model}`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

async function generateReport(databases, periodStart, periodEnd, requestedBy, log) {
  // Dynamic import of logic module
  const { aggregateIncidents, buildAnalyticsPrompt, SECURITY_ANALYST_SYSTEM_PROMPT } =
    await import('./ai-report-logic.js');

  const incidents = await fetchIncidents(databases, periodStart, periodEnd);

  if (incidents.length === 0) {
    const emptyRecord = {
      report_type: requestedBy ? 'on_demand' : 'periodic',
      period_start: periodStart,
      period_end: periodEnd,
      summary: 'No incidents found in the specified period.',
      recommendations: '',
      stats_json: JSON.stringify({ totalIncidents: 0 }),
      model_used: 'none',
      generated_at: new Date().toISOString(),
      requested_by: requestedBy || '',
    };

    const doc = await databases.createDocument(DB_ID(), REPORTS_ID(), ID.unique(), emptyRecord);
    log(`[copcivil-ai-report] Empty-period report generated: ${doc.$id}`);
    return { $id: doc.$id, ...emptyRecord };
  }

  const stats = aggregateIncidents(incidents);
  const model = (await getConfig(databases, 'openrouter_model')) || 'anthropic/claude-sonnet-4';
  const prompt = buildAnalyticsPrompt(stats, { start: periodStart, end: periodEnd });
  const aiResponse = await callOpenRouter(model, SECURITY_ANALYST_SYSTEM_PROMPT, prompt, log);

  // Split AI response into summary and recommendations
  const recommendationsMatch = aiResponse.match(/##?\s*(?:4\.|Recommendations)([\s\S]*?)(?=##?\s*(?:5\.|Trend)|$)/i);
  const recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : '';

  const record = {
    report_type: requestedBy ? 'on_demand' : 'periodic',
    period_start: periodStart,
    period_end: periodEnd,
    summary: aiResponse.slice(0, 10000),
    recommendations: recommendations.slice(0, 5000),
    stats_json: JSON.stringify(stats).slice(0, 5000),
    model_used: model,
    generated_at: new Date().toISOString(),
    requested_by: requestedBy || '',
  };

  const doc = await databases.createDocument(DB_ID(), REPORTS_ID(), ID.unique(), record);
  log(`[copcivil-ai-report] Report generated: ${doc.$id} | Incidents analyzed: ${stats.totalIncidents}`);

  return { $id: doc.$id, ...record };
}

async function handleGenerate(databases, req, log) {
  const rateLimited = await checkRateLimit(databases, log);
  if (rateLimited) {
    return { _status: 429, error: 'Rate limited. Max 1 report per 5 minutes.' };
  }

  const body = parseBody(req);
  if (!body.period_start || !body.period_end) {
    return { _status: 400, error: 'Missing required fields: period_start, period_end.' };
  }

  const requestedBy = req.headers?.['x-appwrite-user-id'] || '';
  return await generateReport(databases, body.period_start, body.period_end, requestedBy, log);
}

async function handlePeriodic(databases, log) {
  const rateLimited = await checkRateLimit(databases, log);
  if (rateLimited) {
    return { _status: 429, error: 'Rate limited.' };
  }

  const periodEnd = new Date().toISOString();
  const periodStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  return await generateReport(databases, periodStart, periodEnd, null, log);
}

export default async ({ req, res, log, error }) => {
  try {
    const client = initClient();
    const databases = new Databases(client);

    // Appwrite executions can arrive with method/path variations depending on SDK/runtime.
    // Normalize them so frontend calls don't fail with false-negative "Route not found".
    const method = (req.method || 'GET').toUpperCase();
    const rawPath = req.path || '/';
    const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;

    let result;

    if ((path === '/generate' || path === '/') && (method === 'POST' || method === 'GET')) {
      result = await handleGenerate(databases, req, log);
    } else if (path === '/periodic' && method === 'POST') {
      result = await handlePeriodic(databases, log);
    } else {
      return res.json({ error: 'Route not found.' }, 404);
    }

    const status = result._status || 200;
    if (result._status) delete result._status;
    return res.json(result, status);
  } catch (err) {
    error('[copcivil-ai-report] Error: ' + err.message);
    return res.json({ error: err.message || 'Internal server error.' }, 500);
  }
};
