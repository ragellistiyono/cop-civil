import { truncate, sanitizeForStorage } from './shared/db.js';

/**
 * Extract client IP from request headers.
 * @param {{ headers: Record<string, string> }} req
 * @returns {string}
 */
export function extractClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp.trim();
  }
  return 'unknown';
}

/**
 * Safely parse request body.
 * @param {string | object | null | undefined} body
 * @returns {object}
 */
export function parseBody(body) {
  if (!body || body === '') return {};
  if (typeof body === 'object') return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

/**
 * Build an incident record for Appwrite DB insertion.
 * @param {object} params
 * @param {string} params.ip
 * @param {'edge' | 'function'} params.layer
 * @param {string} params.url
 * @param {string} params.method
 * @param {Record<string, string>} params.headers
 * @param {string} params.bodySnippet
 * @param {import('./shared/types.js').DetectionResult} params.detection
 * @returns {object}
 */
export function buildIncidentRecord({ ip, layer, url, method, headers, bodySnippet, detection }) {
  return {
    ip_address: sanitizeForStorage(truncate(ip, 45)),
    timestamp: new Date().toISOString(),
    layer,
    request_url: sanitizeForStorage(truncate(url, 2048)),
    request_method: truncate(method, 10),
    request_headers: sanitizeForStorage(truncate(JSON.stringify(headers), 4096)),
    request_body_snippet: sanitizeForStorage(truncate(bodySnippet, 2048)),
    matched_patterns: truncate(JSON.stringify(detection.matches.map((m) => m.id)), 2048),
    attack_category: detection.primaryCategory || 'unknown',
    severity: detection.severity || 'low',
    threat_score: detection.score,
    action_taken: detection.action,
    user_agent: sanitizeForStorage(truncate(headers['user-agent'] || '', 512)),
    geo_country: '',
    geo_city: '',
  };
}

/**
 * Determine whether an IP should be auto-blocked based on incident count.
 * @param {number} recentIncidentCount
 * @param {{autoBlockIncidentCount?: number}} config
 * @returns {boolean}
 */
export function shouldAutoBlock(recentIncidentCount, config = {}) {
  const threshold = config.autoBlockIncidentCount ?? 5;
  return recentIncidentCount >= threshold;
}
