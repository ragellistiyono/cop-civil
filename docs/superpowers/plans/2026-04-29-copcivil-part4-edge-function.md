# Copcivil Part 4: Netlify Edge Function (Layer 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Netlify Edge Function that intercepts all HTTP requests at the CDN edge, performs fast pattern matching, enforces the IP blocklist, and logs incidents asynchronously to the copcivil-guard Appwrite Function.

**Architecture:** A single Deno-compatible edge function in `/netlify/edge-functions/`. It imports the detection engine from `/copcivil/engine/` (pure JS, no Node-specific APIs). The blocklist is cached in a module-level variable and refreshed every 5 minutes from the copcivil-guard `/blocklist` endpoint.

**Tech Stack:** Netlify Edge Functions (Deno runtime), pure JS, Vitest for tests.

**Spec Reference:** `docs/superpowers/specs/2026-04-29-copcivil-security-system-design.md` — Section 6

**Depends On:** Part 1 (detection engine) + Part 2 (payload patterns)

---

## File Structure

```
netlify/
└── edge-functions/
    └── copcivil-edge.js       # Layer 1 edge function
netlify.toml                    # Edge function route config (create if missing)

copcivil/
└── __tests__/
    └── edge.test.js           # Tests for edge function logic
copcivil/
└── edge-logic.js              # Testable pure logic extracted from edge handler
```

---

### Task 1: Netlify Configuration

**Files:**
- Create: `netlify.toml`

- [ ] **Step 1: Create netlify.toml**

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[edge_functions]]
  path = "/*"
  function = "copcivil-edge"
```

- [ ] **Step 2: Commit**

```bash
git add netlify.toml
git commit -m "chore: add netlify.toml with edge function config"
```

---

### Task 2: Edge Logic — Testable Pure Functions

**Files:**
- Create: `copcivil/__tests__/edge.test.js`
- Create: `copcivil/edge-logic.js`

- [ ] **Step 1: Write the failing tests**

Create `copcivil/__tests__/edge.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import {
  extractIpFromRequest,
  extractScanTargets,
  isStaticAsset,
  buildBlockedResponse,
  buildLogPayload,
  shouldRefreshBlocklist,
} from '../edge-logic.js';

describe('Edge Logic', () => {
  describe('extractIpFromRequest', () => {
    it('extracts IP from x-nf-client-connection-ip header', () => {
      const headers = new Map([['x-nf-client-connection-ip', '203.0.113.50']]);
      expect(extractIpFromRequest(headers)).toBe('203.0.113.50');
    });

    it('falls back to x-forwarded-for', () => {
      const headers = new Map([['x-forwarded-for', '10.0.0.1, 192.168.1.1']]);
      expect(extractIpFromRequest(headers)).toBe('10.0.0.1');
    });

    it('returns "unknown" when no IP headers', () => {
      const headers = new Map();
      expect(extractIpFromRequest(headers)).toBe('unknown');
    });

    it('trims whitespace', () => {
      const headers = new Map([['x-nf-client-connection-ip', '  10.0.0.1  ']]);
      expect(extractIpFromRequest(headers)).toBe('10.0.0.1');
    });
  });

  describe('extractScanTargets', () => {
    it('extracts URL path and query params', () => {
      const url = new URL('https://example.com/api/users?id=1&name=test');
      const headers = new Map([['cookie', 'session=abc123']]);
      const targets = extractScanTargets(url, headers);

      expect(targets).toContain('/api/users');
      expect(targets).toContain('id=1');
      expect(targets).toContain('name=test');
      expect(targets).toContain('session=abc123');
    });

    it('handles URL with no query params', () => {
      const url = new URL('https://example.com/page');
      const headers = new Map();
      const targets = extractScanTargets(url, headers);

      expect(targets).toContain('/page');
    });

    it('includes referer header if present', () => {
      const url = new URL('https://example.com/');
      const headers = new Map([['referer', 'https://evil.com/<script>']]);
      const targets = extractScanTargets(url, headers);

      expect(targets).toContain('https://evil.com/<script>');
    });
  });

  describe('isStaticAsset', () => {
    it('returns true for .js files', () => {
      expect(isStaticAsset('/assets/main.js')).toBe(true);
    });

    it('returns true for .css files', () => {
      expect(isStaticAsset('/styles/app.css')).toBe(true);
    });

    it('returns true for image files', () => {
      expect(isStaticAsset('/images/logo.png')).toBe(true);
      expect(isStaticAsset('/images/photo.jpg')).toBe(true);
      expect(isStaticAsset('/images/icon.svg')).toBe(true);
      expect(isStaticAsset('/images/banner.webp')).toBe(true);
    });

    it('returns true for font files', () => {
      expect(isStaticAsset('/fonts/inter.woff2')).toBe(true);
    });

    it('returns false for HTML pages', () => {
      expect(isStaticAsset('/about')).toBe(false);
      expect(isStaticAsset('/api/users')).toBe(false);
    });

    it('returns false for root path', () => {
      expect(isStaticAsset('/')).toBe(false);
    });

    it('returns true for favicon', () => {
      expect(isStaticAsset('/favicon.ico')).toBe(true);
    });
  });

  describe('buildBlockedResponse', () => {
    it('returns a 403 response object', () => {
      const resp = buildBlockedResponse('1.2.3.4', 'Blocked by copcivil');
      expect(resp.status).toBe(403);
      expect(resp.body).toContain('403');
      expect(resp.body).toContain('copcivil');
      expect(resp.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('buildLogPayload', () => {
    it('builds a complete log payload for the guard function', () => {
      const payload = buildLogPayload({
        ip: '1.2.3.4',
        url: 'https://example.com/api?id=1 OR 1=1',
        method: 'GET',
        userAgent: 'Mozilla/5.0',
        detection: {
          action: 'blocked',
          score: 17,
          severity: 'high',
          primaryCategory: 'sqli',
          matches: [{ id: 'SQLI-001', pattern: 'or 1=1', category: 'sqli', severity: 'high', position: 5 }],
          matchCount: 1,
        },
      });

      expect(payload.ip_address).toBe('1.2.3.4');
      expect(payload.layer).toBe('edge');
      expect(payload.action_taken).toBe('blocked');
      expect(payload.attack_category).toBe('sqli');
      expect(payload.threat_score).toBe(17);
      expect(payload.user_agent).toBe('Mozilla/5.0');
    });
  });

  describe('shouldRefreshBlocklist', () => {
    it('returns true when lastRefresh is null', () => {
      expect(shouldRefreshBlocklist(null, 300000)).toBe(true);
    });

    it('returns true when interval has passed', () => {
      const old = Date.now() - 400000;
      expect(shouldRefreshBlocklist(old, 300000)).toBe(true);
    });

    it('returns false when within interval', () => {
      const recent = Date.now() - 100000;
      expect(shouldRefreshBlocklist(recent, 300000)).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run copcivil/__tests__/edge.test.js
```

Expected: FAIL — cannot find module `../edge-logic.js`

- [ ] **Step 3: Implement edge-logic.js**

Create `copcivil/edge-logic.js`:
```javascript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run copcivil/__tests__/edge.test.js
```

Expected: ALL PASS (15 tests)

- [ ] **Step 5: Commit**

```bash
git add copcivil/edge-logic.js copcivil/__tests__/edge.test.js
git commit -m "feat(copcivil): add edge function logic with tests"
```

---

### Task 3: Netlify Edge Function Handler

**Files:**
- Create: `netlify/edge-functions/copcivil-edge.js`

- [ ] **Step 1: Create the edge function**

Create `netlify/edge-functions/copcivil-edge.js`:
```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add netlify/edge-functions/copcivil-edge.js
git commit -m "feat(copcivil): add Netlify Edge Function (Layer 1 security gateway)"
```

---

### Task 4: Full Integration Test — Run All Tests

**Files:** None new — this is a verification step.

- [ ] **Step 1: Run the complete test suite**

Run:
```bash
npx vitest run
```

Expected output summary (approximately):
```
 ✓ copcivil/__tests__/aho-corasick.test.js (8 tests)
 ✓ copcivil/__tests__/normalizer.test.js (20 tests)
 ✓ copcivil/__tests__/scorer.test.js (10 tests)
 ✓ copcivil/__tests__/detector.test.js (12 tests)
 ✓ copcivil/__tests__/payloads.test.js (11 tests)
 ✓ copcivil/__tests__/guard.test.js (11 tests)
 ✓ copcivil/__tests__/blocklist.test.js (7 tests)
 ✓ copcivil/__tests__/ai-report.test.js (11 tests)
 ✓ copcivil/__tests__/edge.test.js (15 tests)

 Test Files  9 passed (9)
 Tests       105 passed (105)
```

All 9 test files, ~105 tests should pass.

- [ ] **Step 2: Final commit for Part 4**

```bash
git add -A
git commit -m "feat(copcivil): complete backend — all 105 tests passing"
```

- [ ] **Step 3: Push to remote**

```bash
git push origin main
```

---

## Summary

After completing all 4 tasks, you will have:

| Component | File | Tests |
|---|---|---|
| Netlify config | `netlify.toml` | — |
| Edge logic | `copcivil/edge-logic.js` | 15 tests |
| Edge handler | `netlify/edge-functions/copcivil-edge.js` | — (runtime) |

**Total: 15 new tests, 4 commits, fully functional Layer 1 edge security.**

---

## Backend Complete — Full Summary Across All Parts

| Part | Components | Tests | Commits |
|---|---|---|---|
| Part 1 | AC engine, normalizer, scorer, detector | ~50 | 5 |
| Part 2 | 4 payload JSON files, loader | ~11 | 5 |
| Part 3 | 3 Appwrite Functions, logic modules | ~29 | 8 |
| Part 4 | Edge function, netlify config | ~15 | 4 |
| **Total** | **Full backend** | **~105** | **22** |
