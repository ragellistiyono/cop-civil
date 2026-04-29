/**
 * Copcivil Edge Function — Layer 1 Security Gateway
 *
 * Runs on Netlify Edge (Deno runtime) for every request.
 * Performs:
 *   1. IP blocklist check (cached, refreshed every 5 min)
 *   2. Static asset bypass (skip scanning for .js, .css, images, etc.)
 *   3. Fast pattern matching on URL, headers, query params, cookies
 *   4. Block / warn / pass decision
 *   5. Async incident logging to copcivil-guard Appwrite Function
 */

// --- Module-level cache (persists across requests in same isolate) ---
let cachedBlocklist = new Set();
let lastBlocklistRefresh = null;
const BLOCKLIST_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

let detector = null;

// --- Configuration from Netlify env vars ---
const APPWRITE_ENDPOINT = Deno.env.get('APPWRITE_ENDPOINT') || '';
const APPWRITE_PROJECT_ID = Deno.env.get('APPWRITE_PROJECT_ID') || '';
const COPCIVIL_GUARD_FUNCTION_ID = Deno.env.get('COPCIVIL_GUARD_FUNCTION_ID') || '';
const APPWRITE_API_KEY = Deno.env.get('APPWRITE_API_KEY') || '';

// --- Inline detection engine (bundled for Deno compatibility) ---
// NOTE: In production, these would be bundled at build time.
// For now, we use dynamic imports relative to the project root.
// Netlify Edge Functions support importing from the project directory.

import {
  extractIpFromRequest,
  extractScanTargets,
  isStaticAsset,
  buildBlockedResponse,
  buildLogPayload,
  shouldRefreshBlocklist,
} from '../../copcivil/edge-logic.js';

import { createDetector } from '../../copcivil/engine/index.js';
import { loadAllPatterns } from '../../copcivil/payloads/loader.js';

function initDetector() {
  if (!detector) {
    const patterns = loadAllPatterns();
    detector = createDetector(patterns);
  }
  return detector;
}

async function refreshBlocklist() {
  if (!shouldRefreshBlocklist(lastBlocklistRefresh, BLOCKLIST_REFRESH_INTERVAL)) {
    return;
  }

  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !COPCIVIL_GUARD_FUNCTION_ID) {
    console.warn('[copcivil-edge] Missing Appwrite config, skipping blocklist refresh.');
    lastBlocklistRefresh = Date.now();
    return;
  }

  try {
    const url = `${APPWRITE_ENDPOINT}/functions/${COPCIVIL_GUARD_FUNCTION_ID}/executions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY,
      },
      body: JSON.stringify({
        path: '/blocklist',
        method: 'GET',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const responseBody = typeof data.responseBody === 'string'
        ? JSON.parse(data.responseBody)
        : data.responseBody;

      if (responseBody?.blocklist) {
        cachedBlocklist = new Set(responseBody.blocklist.map((b) => b.ip_address));
      }
    }
  } catch (err) {
    console.error('[copcivil-edge] Blocklist refresh failed:', err.message);
  }

  lastBlocklistRefresh = Date.now();
}

async function logIncidentAsync(payload) {
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !COPCIVIL_GUARD_FUNCTION_ID) {
    return;
  }

  try {
    const url = `${APPWRITE_ENDPOINT}/functions/${COPCIVIL_GUARD_FUNCTION_ID}/executions`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY,
      },
      body: JSON.stringify({
        path: '/log',
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    }).catch((err) => {
      console.error('[copcivil-edge] Log failed:', err.message);
    });
  } catch (err) {
    console.error('[copcivil-edge] Log error:', err.message);
  }
}

export default async (request, context) => {
  const url = new URL(request.url);

  // 1. Skip static assets — no security scanning needed
  if (isStaticAsset(url.pathname)) {
    return context.next();
  }

  // 2. Refresh blocklist cache if needed
  await refreshBlocklist();

  // 3. Extract client IP
  const ip = extractIpFromRequest(request.headers);

  // 4. Check IP blocklist
  if (cachedBlocklist.has(ip)) {
    const blocked = buildBlockedResponse(ip, 'IP is blocked.');
    return new Response(blocked.body, {
      status: blocked.status,
      headers: blocked.headers,
    });
  }

  // 5. Extract scan targets and run detection
  const scanInput = extractScanTargets(url, request.headers);
  const det = initDetector();
  const result = det.detect(scanInput);

  // 6. Handle detection result
  if (result.action === 'blocked') {
    const blocked = buildBlockedResponse(ip, 'Malicious request detected.');

    // Fire-and-forget log
    const logPayload = buildLogPayload({
      ip,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent') || '',
      detection: result,
    });
    logIncidentAsync(logPayload);

    return new Response(blocked.body, {
      status: blocked.status,
      headers: blocked.headers,
    });
  }

  if (result.action === 'warned') {
    // Pass through but log
    const logPayload = buildLogPayload({
      ip,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent') || '',
      detection: result,
    });
    logIncidentAsync(logPayload);
  }

  // 7. Clean request — pass through
  return context.next();
};
