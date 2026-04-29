# Copcivil — Web Exploitation Detection & Prevention System

**Date**: 2026-04-29
**System Name**: copcivil
**Thesis Title**: Web Exploitation Detection and Prevention System with Mitigation via IP Blocking and AI-Based Analytical Reporting
**Integration Target**: CIVIL QTRACK personal website (Netlify + Appwrite)

---

## 1. Overview

Copcivil is a layered web security system that detects malicious payloads, blocks attacking IPs, logs incidents, and generates AI-driven analytics reports. It integrates into an existing React + Vite + Appwrite website deployed on Netlify.

### Core Functions

- **Malicious payload detection** via Aho-Corasick algorithm with normalization pipeline
- **IP blocking** with hybrid auto-block + admin override
- **Incident logging** with full request capture to Appwrite database
- **AI-driven analytics** via OpenRouter API with flexible LLM selection

### Attack Categories

- SQL Injection (SQLi)
- Cross-Site Scripting (XSS)
- Command Injection (CMDi)
- Path Traversal / Local File Inclusion (LFI)

---

## 2. Architecture

### 2.1 Layered Defense Model

```
User → Netlify Edge (Layer 1: fast detection + IP blocking)
     → React SPA served
     → Appwrite Functions (Layer 2: deep body inspection)
     → Appwrite Database (shared: incidents, blocklist, reports, config)
     → AI Analytics Engine (periodic + on-demand via OpenRouter)
```

**Layer 1 — Netlify Edge Function**: Intercepts ALL HTTP requests at CDN edge. Performs fast pattern matching on URL, headers, query parameters, cookies. Enforces IP blocklist. Runs on Deno runtime with 50ms CPU limit.

**Layer 2 — Appwrite Functions**: Deep inspection of request bodies, form fields, JSON payloads. Runs inside Appwrite's server-side environment (Node.js). Called as middleware within existing Appwrite Functions.

**Shared Backend — Appwrite Database**: Centralized storage for incident logs, IP blocklist, AI reports, and system configuration. Both layers write to the same database.

### 2.2 Integration Strategy

**Monorepo approach** — copcivil code lives within the existing `cop-civil-main` repository under a dedicated `/copcivil` directory. Netlify edge functions deploy from `/netlify/edge-functions/`. Appwrite Functions remain in `/functions/`.

Rationale: single repo for thesis presentation, shared deployment config, no publishing overhead, Netlify auto-deploys edge functions from repo.

### 2.3 Directory Structure

```
cop-civil-main/
├── copcivil/                         # Security engine core
│   ├── engine/
│   │   ├── aho-corasick.js           # AC automaton builder + matcher
│   │   ├── normalizer.js             # Input normalization pipeline
│   │   ├── scorer.js                 # Threat scoring logic
│   │   ├── detector.js               # Main detection pipeline
│   │   └── index.js                  # Public API
│   ├── payloads/
│   │   ├── sqli.json                 # SQL Injection patterns
│   │   ├── xss.json                  # Cross-Site Scripting patterns
│   │   ├── cmdi.json                 # Command Injection patterns
│   │   ├── path-traversal.json       # Path Traversal patterns
│   │   └── loader.js                 # Loads + merges all pattern files
│   ├── shared/
│   │   ├── constants.js              # Severity levels, thresholds, defaults
│   │   └── types.js                  # JSDoc type definitions
│   └── __tests__/
│       ├── aho-corasick.test.js
│       ├── normalizer.test.js
│       ├── scorer.test.js
│       ├── detector.test.js
│       └── payloads.test.js
├── netlify/
│   └── edge-functions/
│       └── copcivil-edge.js          # Layer 1 edge function
├── functions/
│   ├── copcivil-guard/               # Layer 2 deep inspection
│   │   ├── src/main.js
│   │   └── package.json
│   ├── copcivil-ai-report/           # AI analytics engine
│   │   ├── src/main.js
│   │   └── package.json
│   └── copcivil-blocklist/           # IP blocklist management
│       ├── src/main.js
│       └── package.json
└── ...existing files
```

---

## 3. Detection Engine

### 3.1 Aho-Corasick Algorithm

Pure JavaScript implementation (no native dependencies) for cross-runtime compatibility (Node.js + Deno).

**Build phase** (cold start):
1. Load all patterns from categorized JSON files
2. Build trie from pattern strings
3. Compute failure links via BFS
4. Produce reusable automaton object

**Match phase** (per request, O(n + m)):
1. Feed normalized input into automaton
2. Traverse trie character-by-character
3. Return matches: `{ patternId, category, severity, position }`

### 3.2 Normalization Pipeline

Applied sequentially before pattern matching:

| Step | Function | Example |
|---|---|---|
| URL decode | `%27` → `'` | `%3Cscript%3E` → `<script>` |
| Double decode | Catch double-encoded | `%2527` → `%27` → `'` |
| HTML entity decode | `&#60;` → `<` | `&#60;script&#62;` → `<script>` |
| Case fold | Lowercase all | `SeLeCt` → `select` |
| SQL comment strip | Remove `/**/`, `--`, `#` | `SEL/**/ECT` → `SELECT` |
| Whitespace collapse | Multi-space → single | `UNION   SELECT` → `UNION SELECT` |
| Null byte strip | Remove `\x00` | `sel\x00ect` → `select` |

### 3.3 Scoring System

```
threat_score = Σ (pattern_severity_weight × match_count)
```

| Severity | Weight | Examples |
|---|---|---|
| critical | 10 | `DROP TABLE`, `<script>document.cookie` |
| high | 7 | `UNION SELECT`, `<svg onload=` |
| medium | 4 | `OR 1=1`, `<img src=x onerror=` |
| low | 1 | `SELECT`, `../` (single traversal) |

**Decision thresholds** (configurable via `security_config`):

| Score Range | Action |
|---|---|
| ≥ 15 | **BLOCK** — respond 403 |
| 7–14 | **WARN** — pass through, log incident |
| < 7 | **LOG** — informational only |

### 3.4 Detection Pipeline

```
Input (URL + headers + params + body)
  → Normalizer.normalize(input)
  → AhoCorasick.search(normalizedInput)
  → Scorer.evaluate(matches)
  → Decision { action, score, matches, category }
```

---

## 4. Payload Storage

### 4.1 Format

Categorized JSON files, one per attack type. Each file contains:

```json
{
  "category": "sqli",
  "description": "SQL Injection detection patterns",
  "version": "1.0.0",
  "patterns": [
    { "id": "SQLI-001", "pattern": "union select", "severity": "high", "description": "UNION-based injection" },
    { "id": "SQLI-002", "pattern": "or 1=1", "severity": "medium", "description": "Boolean-based tautology" }
  ]
}
```

### 4.2 Loader

`loader.js` reads all JSON files, validates schema, merges into a flat pattern array for AC automaton construction. Patterns are stored in lowercase (matching is case-insensitive via normalization).

---

## 5. Appwrite Database Schema

### 5.1 `security_incidents` Collection

| Attribute | Type | Required | Description |
|---|---|---|---|
| `ip_address` | string(45) | yes | Attacker IP (IPv4/IPv6) |
| `timestamp` | datetime | yes | Incident time |
| `layer` | enum[edge, function] | yes | Detection layer |
| `request_url` | string(2048) | yes | Full request URL |
| `request_method` | string(10) | yes | HTTP method |
| `request_headers` | string(4096) | no | JSON-stringified headers |
| `request_body_snippet` | string(2048) | no | First 2KB of body |
| `matched_patterns` | string(2048) | yes | JSON array of pattern IDs |
| `attack_category` | string(50) | yes | Primary category |
| `severity` | enum[critical, high, medium, low] | yes | Highest severity matched |
| `threat_score` | integer | yes | Calculated score |
| `action_taken` | enum[blocked, warned, logged] | yes | System action |
| `user_agent` | string(512) | no | Client user agent |
| `geo_country` | string(2) | no | Country code |
| `geo_city` | string(100) | no | City |

Indexes: `ip_address`, `timestamp` (desc), `attack_category`, `severity`, `action_taken`

### 5.2 `ip_blocklist` Collection

| Attribute | Type | Required | Description |
|---|---|---|---|
| `ip_address` | string(45) | yes | Blocked IP (unique) |
| `reason` | string(500) | yes | Block reason |
| `blocked_at` | datetime | yes | Block start time |
| `expires_at` | datetime | no | Auto-block expiry (null = permanent) |
| `block_type` | enum[auto, manual] | yes | Block method |
| `incident_count` | integer | yes | Total incidents from IP |
| `status` | enum[active, expired, whitelisted] | yes | Current status |

Indexes: `ip_address` (unique), `status`, `expires_at`

### 5.3 `ai_reports` Collection

| Attribute | Type | Required | Description |
|---|---|---|---|
| `report_type` | enum[periodic, on_demand] | yes | Trigger type |
| `period_start` | datetime | yes | Analysis start |
| `period_end` | datetime | yes | Analysis end |
| `summary` | string(10000) | yes | AI-generated summary |
| `recommendations` | string(5000) | no | AI recommendations |
| `stats_json` | string(5000) | yes | JSON: aggregated stats |
| `model_used` | string(100) | yes | LLM model name |
| `generated_at` | datetime | yes | Report creation time |
| `requested_by` | string(36) | no | Admin user ID |

### 5.4 `security_config` Collection

| Attribute | Type | Required | Description |
|---|---|---|---|
| `key` | string(50) | yes | Config key (unique) |
| `value` | string(2000) | yes | Config value (JSON for complex) |
| `description` | string(200) | no | Description |

Default configuration keys:
- `block_threshold` → `15`
- `warn_threshold` → `7`
- `auto_block_incident_count` → `5`
- `auto_block_window_minutes` → `10`
- `auto_block_duration_hours` → `24`
- `openrouter_model` → `"anthropic/claude-sonnet-4"`
- `periodic_report_cron` → `"0 0 * * *"` (daily at midnight)
- `admin_whitelist_ips` → `"[]"` (JSON array)

---

## 6. Netlify Edge Function (Layer 1)

### 6.1 Request Interception

Edge function runs on ALL routes (`/*`). Execution flow:

1. Extract client IP from `x-nf-client-connection-ip` or `x-forwarded-for`
2. Check IP against cached blocklist (module-level variable, refreshed every 5 min)
3. If blocked → return `403 Forbidden`
4. Extract targets: URL path, query params, cookie values, select headers
5. Run detection pipeline (normalize → AC match → score)
6. If score ≥ block_threshold → return `403`, async log incident
7. If score ≥ warn_threshold → pass through, async log incident
8. Clean → pass through

### 6.2 Constraints

- Deno runtime — pure JS only, no Node-specific APIs
- 50ms CPU time limit — AC automaton built at module level (cold start cached)
- Blocklist refresh: fetch from Appwrite API every 5 minutes, cache in module-level variable

### 6.3 Incident Logging from Edge

Fire-and-forget POST to the Appwrite Function execution endpoint (`copcivil-guard /log` route). The edge function constructs the Appwrite REST API URL using environment variables (`APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `COPCIVIL_GUARD_FUNCTION_ID`) available via Netlify environment variables (set in Netlify dashboard, not `VITE_` prefixed). This avoids the edge function needing the full Appwrite SDK (which is Node-specific).

---

## 7. Appwrite Functions

### 7.1 `copcivil-guard` — Security Middleware + Logger

**Routes**:
- `POST /scan` — Receives scan requests from edge function or other Appwrite Functions
- `POST /log` — Receives incident log entries from edge function
- `GET /blocklist` — Returns current active blocklist (used by edge function cache refresh)

**Internal logic**:
- Runs detection pipeline on request body/params
- Checks if IP should be auto-blocked (count incidents in window)
- Inserts incident record into `security_incidents`
- Updates `ip_blocklist` if threshold exceeded

### 7.2 `copcivil-ai-report` — AI Analytics

**Routes**:
- `POST /generate` — On-demand report generation (admin-triggered)
- `POST /periodic` — Scheduled periodic report (CRON-triggered)

**Logic**:
1. Query `security_incidents` for time range
2. Aggregate statistics
3. Build structured prompt for LLM
4. Call OpenRouter API with admin-selected model
5. Store report in `ai_reports`

**Rate limit**: Max 1 report per 5 minutes.

### 7.3 `copcivil-blocklist` — Blocklist Management

**Routes**:
- `GET /list` — List all blocked IPs (with pagination, filtering)
- `POST /block` — Manually block an IP (admin only)
- `POST /unblock` — Unblock or whitelist an IP (admin only)
- `POST /cleanup` — Expire old auto-blocks past their `expires_at`

---

## 8. AI Analytics via OpenRouter

### 8.1 Integration

OpenRouter API key stored in Appwrite Function environment variable `OPENROUTER_API_KEY`.

Request format:
```javascript
fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: configuredModel,
    messages: [
      { role: 'system', content: SECURITY_ANALYST_SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(aggregatedData) }
    ]
  })
});
```

### 8.2 Flexible Model Selection

Admin can change the LLM model via `security_config` → `openrouter_model`. The dashboard will show available models from OpenRouter's catalog. Default: `anthropic/claude-sonnet-4`.

### 8.3 Report Content

Each report includes:
- Total incidents in period
- Breakdown by attack category
- Breakdown by severity
- Top 10 attacking IPs
- Top 10 targeted endpoints
- Trend analysis (comparison with previous period)
- Risk assessment
- Actionable recommendations

---

## 9. Security Considerations

| Threat | Mitigation |
|---|---|
| Admin dashboard compromise | Appwrite auth + admin-only labels via `ProtectedRoute adminOnly` |
| API key exposure | OpenRouter key in Appwrite Function env vars only |
| Blocklist cache poisoning | Blocklist writeable only by server-side Appwrite Functions |
| Edge function bypass | Edge function on `/*` — no URL-based bypass |
| Log injection | All stored strings truncated + sanitized before DB insert |
| AI report abuse | Max 1 report per 5 minutes rate limit |
| Self-blocking | Admin whitelist IPs in `security_config` |
| Pattern file tampering | Patterns bundled at build time, not fetched at runtime |

---

## 10. Testing Strategy (Backend)

| Layer | What | Tool |
|---|---|---|
| Unit | AC automaton build/match, normalizer steps, scorer calculations | Vitest |
| Unit | Payload file loading, schema validation, pattern coverage | Vitest |
| Integration | Edge function handler with mock Request objects | Vitest |
| Integration | Appwrite Function handlers with mock req/res | Vitest |
| E2E | Curl scripts with real malicious payloads against local dev | Manual scripts |

Test files location: `copcivil/__tests__/`

---

## 11. Environment Variables (New)

Add to `.env.example`:
```
# Copcivil Security System
VITE_APPWRITE_DATABASE_SECURITY_ID=your-security-database-id
VITE_APPWRITE_COLLECTION_INCIDENTS=your-incidents-collection-id
VITE_APPWRITE_COLLECTION_BLOCKLIST=your-blocklist-collection-id
VITE_APPWRITE_COLLECTION_AI_REPORTS=your-ai-reports-collection-id
VITE_APPWRITE_COLLECTION_SECURITY_CONFIG=your-security-config-collection-id
VITE_APPWRITE_FUNCTION_COPCIVIL_GUARD=your-guard-function-id
VITE_APPWRITE_FUNCTION_COPCIVIL_AI_REPORT=your-ai-report-function-id
VITE_APPWRITE_FUNCTION_COPCIVIL_BLOCKLIST=your-blocklist-function-id
OPENROUTER_API_KEY=your-openrouter-api-key (Appwrite Function env only)
```

---

## 12. Scope Boundaries

### In scope (this spec)
- Detection engine (AC + normalizer + scorer)
- Payload pattern files (4 categories)
- Netlify edge function (Layer 1)
- Appwrite Functions (Layer 2 guard, AI report, blocklist management)
- Appwrite database collections setup
- Backend unit + integration tests

### Out of scope (future work)
- Admin dashboard frontend (Phase 2)
- Real-time dashboard with WebSocket/SSE
- Machine learning-based detection
- Custom WAF rule editor
- Multi-tenant support
