const STATIC_EXTENSIONS = new Set([
  '.js', '.css', '.map',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.avif',
  '.woff', '.woff2', '.ttf', '.eot',
  '.json', '.xml', '.txt', '.robots',
  '.mp4', '.webm', '.ogg', '.mp3',
  '.pdf', '.zip', '.gz',
]);

/**
 * Extract client IP from edge request headers.
 * Netlify provides x-nf-client-connection-ip; falls back to x-forwarded-for.
 * @param {Map<string, string> | Headers} headers
 * @returns {string}
 */
export function extractIpFromRequest(headers) {
  const get = (key) => (typeof headers.get === 'function' ? headers.get(key) : headers[key]);

  const nfIp = get('x-nf-client-connection-ip');
  if (nfIp) return nfIp.trim();

  const forwarded = get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return 'unknown';
}

/**
 * Extract all scan targets from the request URL and headers.
 * Concatenates path, query params, cookies, and referer into one string.
 * @param {URL} url
 * @param {Map<string, string> | Headers} headers
 * @returns {string}
 */
export function extractScanTargets(url, headers) {
  const get = (key) => (typeof headers.get === 'function' ? headers.get(key) : headers[key]);

  const parts = [url.pathname];

  for (const [key, value] of url.searchParams.entries()) {
    parts.push(`${key}=${value}`);
  }

  const cookie = get('cookie');
  if (cookie) parts.push(cookie);

  const referer = get('referer');
  if (referer) parts.push(referer);

  return parts.join(' ');
}

/**
 * Check if a URL path points to a static asset (skip scanning).
 * @param {string} pathname
 * @returns {boolean}
 */
export function isStaticAsset(pathname) {
  const lastDot = pathname.lastIndexOf('.');
  if (lastDot === -1) return false;
  const ext = pathname.slice(lastDot).toLowerCase();
  return STATIC_EXTENSIONS.has(ext);
}

/**
 * Build a 403 Forbidden JSON response.
 * @param {string} ip
 * @param {string} reason
 * @returns {{status: number, body: string, headers: Record<string, string>}}
 */
export function buildBlockedResponse(ip, reason) {
  return {
    status: 403,
    body: JSON.stringify({
      error: '403 Forbidden',
      message: 'Request blocked by copcivil security system.',
      reason,
    }),
    headers: {
      'Content-Type': 'application/json',
      'X-Copcivil-Blocked': 'true',
    },
  };
}

/**
 * Build a log payload to send to the copcivil-guard /log endpoint.
 * @param {object} params
 * @param {string} params.ip
 * @param {string} params.url
 * @param {string} params.method
 * @param {string} params.userAgent
 * @param {object} params.detection
 * @returns {object}
 */
export function buildLogPayload({ ip, url, method, userAgent, detection }) {
  return {
    ip_address: ip,
    layer: 'edge',
    request_url: url,
    request_method: method,
    request_headers: JSON.stringify({}),
    request_body_snippet: '',
    matched_patterns: JSON.stringify(detection.matches.map((m) => m.id)),
    attack_category: detection.primaryCategory || 'unknown',
    severity: detection.severity || 'low',
    threat_score: detection.score,
    action_taken: detection.action,
    user_agent: userAgent,
  };
}

/**
 * Determine whether the blocklist cache should be refreshed.
 * @param {number | null} lastRefreshTimestamp
 * @param {number} intervalMs - Refresh interval in milliseconds (default 5 min)
 * @returns {boolean}
 */
export function shouldRefreshBlocklist(lastRefreshTimestamp, intervalMs = 300000) {
  if (lastRefreshTimestamp === null) return true;
  return Date.now() - lastRefreshTimestamp >= intervalMs;
}
