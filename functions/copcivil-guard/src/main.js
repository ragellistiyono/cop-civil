import { Client, Databases, ID, Query } from 'node-appwrite';

/**
 * Copcivil Guard — Layer 2 Security Middleware + Incident Logger
 *
 * Routes:
 *   POST /scan    — Deep-scan a request body/params
 *   POST /log     — Log an incident from edge function
 *   GET  /blocklist — Return active blocklist for edge cache
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

function truncate(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

function sanitize(str) {
  if (!str) return '';
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

const DB_ID = () => process.env.COPCIVIL_DATABASE_ID;
const INCIDENTS_ID = () => process.env.COPCIVIL_COLLECTION_INCIDENTS;
const BLOCKLIST_ID = () => process.env.COPCIVIL_COLLECTION_BLOCKLIST;
const CONFIG_ID = () => process.env.COPCIVIL_COLLECTION_SECURITY_CONFIG;

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

async function handleScan(databases, req, log) {
  const body = parseBody(req);
  const { input, ip, url, method, headers: reqHeaders } = body;

  if (!input) {
    return { _status: 400, error: 'Missing "input" field for scanning.' };
  }

  // Dynamic import of detection engine (bundled at deploy)
  const { createDetector } = await import('../../../copcivil/engine/index.js');
  const { loadAllPatterns } = await import('../../../copcivil/payloads/loader.js');

  const blockThreshold = parseInt(await getConfig(databases, 'block_threshold')) || 15;
  const warnThreshold = parseInt(await getConfig(databases, 'warn_threshold')) || 7;

  const patterns = loadAllPatterns();
  const detector = createDetector(patterns, { blockThreshold, warnThreshold });
  const detection = detector.detect(input);

  if (detection.action !== 'logged') {
    const record = {
      ip_address: sanitize(truncate(ip || 'unknown', 45)),
      timestamp: new Date().toISOString(),
      layer: 'function',
      request_url: sanitize(truncate(url || '', 2048)),
      request_method: truncate(method || 'UNKNOWN', 10),
      request_headers: sanitize(truncate(JSON.stringify(reqHeaders || {}), 4096)),
      request_body_snippet: sanitize(truncate(input, 2048)),
      matched_patterns: truncate(JSON.stringify(detection.matches.map(m => m.id)), 2048),
      attack_category: detection.primaryCategory || 'unknown',
      severity: detection.severity || 'low',
      threat_score: detection.score,
      action_taken: detection.action,
      user_agent: sanitize(truncate((reqHeaders || {})['user-agent'] || '', 512)),
      geo_country: '',
      geo_city: '',
    };

    await databases.createDocument(DB_ID(), INCIDENTS_ID(), ID.unique(), record);
    log(`[copcivil-guard] Incident logged: ${detection.action} | IP: ${ip} | Score: ${detection.score}`);

    // Check auto-block
    await checkAutoBlock(databases, ip || 'unknown', log);
  }

  return {
    action: detection.action,
    score: detection.score,
    severity: detection.severity,
    category: detection.primaryCategory,
    matchCount: detection.matchCount,
  };
}

async function handleLog(databases, req, log) {
  const body = parseBody(req);
  const {
    ip_address, layer, request_url, request_method, request_headers,
    request_body_snippet, matched_patterns, attack_category, severity,
    threat_score, action_taken, user_agent,
  } = body;

  if (!ip_address || !action_taken) {
    return { _status: 400, error: 'Missing required fields: ip_address, action_taken.' };
  }

  const record = {
    ip_address: sanitize(truncate(ip_address, 45)),
    timestamp: new Date().toISOString(),
    layer: layer || 'edge',
    request_url: sanitize(truncate(request_url || '', 2048)),
    request_method: truncate(request_method || 'UNKNOWN', 10),
    request_headers: sanitize(truncate(request_headers || '{}', 4096)),
    request_body_snippet: sanitize(truncate(request_body_snippet || '', 2048)),
    matched_patterns: truncate(matched_patterns || '[]', 2048),
    attack_category: attack_category || 'unknown',
    severity: severity || 'low',
    threat_score: threat_score || 0,
    action_taken,
    user_agent: sanitize(truncate(user_agent || '', 512)),
    geo_country: '',
    geo_city: '',
  };

  await databases.createDocument(DB_ID(), INCIDENTS_ID(), ID.unique(), record);
  log(`[copcivil-guard] Edge incident logged: ${action_taken} | IP: ${ip_address}`);

  await checkAutoBlock(databases, ip_address, log);

  return { success: true };
}

async function checkAutoBlock(databases, ip, log) {
  const autoBlockCount = parseInt(await getConfig(databases, 'auto_block_incident_count')) || 5;
  const windowMinutes = parseInt(await getConfig(databases, 'auto_block_window_minutes')) || 10;
  const blockHours = parseInt(await getConfig(databases, 'auto_block_duration_hours')) || 24;

  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const recent = await databases.listDocuments(DB_ID(), INCIDENTS_ID(), [
    Query.equal('ip_address', ip),
    Query.greaterThan('timestamp', windowStart),
    Query.limit(autoBlockCount + 1),
  ]);

  if (recent.total >= autoBlockCount) {
    // Check if already blocked
    const existing = await databases.listDocuments(DB_ID(), BLOCKLIST_ID(), [
      Query.equal('ip_address', ip),
      Query.equal('status', 'active'),
      Query.limit(1),
    ]);

    if (existing.total === 0) {
      // Check whitelist
      const whitelistStr = await getConfig(databases, 'admin_whitelist_ips');
      const whitelist = whitelistStr ? JSON.parse(whitelistStr) : [];
      if (whitelist.includes(ip)) {
        log(`[copcivil-guard] IP ${ip} is whitelisted, skipping auto-block.`);
        return;
      }

      const expiresAt = new Date(Date.now() + blockHours * 60 * 60 * 1000).toISOString();
      await databases.createDocument(DB_ID(), BLOCKLIST_ID(), ID.unique(), {
        ip_address: ip,
        reason: `Auto-blocked: ${recent.total} incidents in ${windowMinutes} minutes`,
        blocked_at: new Date().toISOString(),
        expires_at: expiresAt,
        block_type: 'auto',
        incident_count: recent.total,
        status: 'active',
      });
      log(`[copcivil-guard] Auto-blocked IP: ${ip} (expires: ${expiresAt})`);
    }
  }
}

async function handleGetBlocklist(databases) {
  const docs = await databases.listDocuments(DB_ID(), BLOCKLIST_ID(), [
    Query.equal('status', 'active'),
    Query.limit(1000),
  ]);

  return {
    blocklist: docs.documents.map((d) => ({
      ip_address: d.ip_address,
      expires_at: d.expires_at,
      block_type: d.block_type,
    })),
    total: docs.total,
  };
}

export default async ({ req, res, log, error }) => {
  try {
    const client = initClient();
    const databases = new Databases(client);

    const method = req.method;
    const path = req.path || '/';

    let result;

    if (path === '/scan' && method === 'POST') {
      result = await handleScan(databases, req, log);
    } else if (path === '/log' && method === 'POST') {
      result = await handleLog(databases, req, log);
    } else if (path === '/blocklist' && method === 'GET') {
      result = await handleGetBlocklist(databases);
    } else {
      return res.json({ error: 'Route not found.' }, 404);
    }

    const status = result._status || 200;
    if (result._status) delete result._status;
    return res.json(result, status);
  } catch (err) {
    error('[copcivil-guard] Error: ' + err.message);
    return res.json({ error: err.message || 'Internal server error.' }, 500);
  }
};
