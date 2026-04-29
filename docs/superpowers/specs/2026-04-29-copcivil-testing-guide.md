# Copcivil — Pre-Production Testing & Appwrite Setup Guide

**Date**: 2026-04-29
**Purpose**: Step-by-step guide to set up Appwrite resources, test the full copcivil security system locally and on Netlify, and verify the admin dashboard with real attack data.

---

## Phase 0: Appwrite Console Setup

### 0.1 Create Security Database

1. Go to **Appwrite Console** → **Databases** → **Create Database**
2. Name: `copcivil_security`
3. Copy the **Database ID** → paste into `.env` as `VITE_APPWRITE_DATABASE_SECURITY_ID`

### 0.2 Create Collections

Create all 4 collections inside the `copcivil_security` database.

#### Collection 1: `security_incidents`

| Attribute | Type | Size | Required | Default |
|---|---|---|---|---|
| `ip_address` | String | 45 | Yes | — |
| `timestamp` | Datetime | — | Yes | — |
| `layer` | Enum (`edge`, `function`) | — | Yes | — |
| `request_url` | String | 2048 | Yes | — |
| `request_method` | String | 10 | Yes | — |
| `request_headers` | String | 4096 | No | — |
| `request_body_snippet` | String | 2048 | No | — |
| `matched_patterns` | String | 2048 | Yes | — |
| `attack_category` | String | 50 | Yes | — |
| `severity` | Enum (`critical`, `high`, `medium`, `low`) | — | Yes | — |
| `threat_score` | Integer | — | Yes | — |
| `action_taken` | Enum (`blocked`, `warned`, `logged`) | — | Yes | — |
| `user_agent` | String | 512 | No | — |
| `geo_country` | String | 2 | No | — |
| `geo_city` | String | 100 | No | — |

**Indexes** (create in Appwrite Console → Collection → Indexes):
- `ip_address` — type: Key
- `timestamp` — type: Key, order: DESC
- `attack_category` — type: Key
- `severity` — type: Key
- `action_taken` — type: Key

**Permissions** (Settings tab):
- Any role: Read ✓ (needed for edge function blocklist lookups)
- Users role: Create ✓

#### Collection 2: `ip_blocklist`

| Attribute | Type | Size | Required | Default |
|---|---|---|---|---|
| `ip_address` | String | 45 | Yes | — |
| `reason` | String | 500 | Yes | — |
| `blocked_at` | Datetime | — | Yes | — |
| `expires_at` | Datetime | — | No | — |
| `block_type` | Enum (`auto`, `manual`) | — | Yes | — |
| `incident_count` | Integer | — | Yes | — |
| `status` | Enum (`active`, `expired`, `whitelisted`) | — | Yes | — |

**Indexes**:
- `ip_address` — type: Unique
- `status` — type: Key
- `expires_at` — type: Key

**Permissions**: Same as `security_incidents`.

#### Collection 3: `ai_reports`

| Attribute | Type | Size | Required | Default |
|---|---|---|---|---|
| `report_type` | Enum (`periodic`, `on_demand`) | — | Yes | — |
| `period_start` | Datetime | — | Yes | — |
| `period_end` | Datetime | — | Yes | — |
| `summary` | String | 10000 | Yes | — |
| `recommendations` | String | 5000 | No | — |
| `stats_json` | String | 5000 | Yes | — |
| `model_used` | String | 100 | Yes | — |
| `generated_at` | Datetime | — | Yes | — |
| `requested_by` | String | 36 | No | — |

**Indexes**:
- `generated_at` — type: Key, order: DESC

**Permissions**: Same as above.

#### Collection 4: `security_config`

| Attribute | Type | Size | Required | Default |
|---|---|---|---|---|
| `key` | String | 50 | Yes | — |
| `value` | String | 2000 | Yes | — |
| `description` | String | 200 | No | — |

**Indexes**:
- `key` — type: Unique

**Permissions**: Same as above.

**Insert default documents** (Appwrite Console → Collection → Create Document):

| key | value | description |
|---|---|---|
| `block_threshold` | `15` | Minimum score to block a request |
| `warn_threshold` | `7` | Minimum score to warn/log |
| `auto_block_incident_count` | `5` | Incidents before auto-block triggers |
| `auto_block_window_minutes` | `10` | Time window for counting incidents |
| `auto_block_duration_hours` | `24` | How long auto-blocks last |
| `openrouter_model` | `anthropic/claude-sonnet-4` | LLM model for AI reports |
| `admin_whitelist_ips` | `[]` | JSON array of whitelisted IPs |

### 0.3 Create Appwrite API Key

1. Go to **Appwrite Console** → **Overview** → **API Keys** → **Create API Key**
2. Name: `copcivil-system`
3. **Scopes**: Select at minimum:
   - `databases.read`
   - `databases.write`
   - `functions.read`
   - `functions.write`
4. Copy the key — you'll need it for Netlify env vars and Appwrite Function env vars.

### 0.4 Deploy Appwrite Functions

For each of the 3 functions, go to **Appwrite Console** → **Functions** → **Create Function**:

#### Function 1: `copcivil-guard`
- **Name**: `copcivil-guard`
- **Runtime**: Node.js 18.0
- **Entrypoint**: `src/main.js`
- **Build commands**: `npm install`
- **Source**: Upload the `/functions/copcivil-guard/` directory (or connect via Git)

#### Function 2: `copcivil-ai-report`
- Same settings, source from `/functions/copcivil-ai-report/`

#### Function 3: `copcivil-blocklist`
- Same settings, source from `/functions/copcivil-blocklist/`

**Environment variables for ALL 3 functions** (Settings → Variables):

| Key | Value |
|---|---|
| `COPCIVIL_DATABASE_ID` | *(Database ID from step 0.1)* |
| `COPCIVIL_COLLECTION_INCIDENTS` | *(Collection ID of security_incidents)* |
| `COPCIVIL_COLLECTION_BLOCKLIST` | *(Collection ID of ip_blocklist)* |
| `COPCIVIL_COLLECTION_AI_REPORTS` | *(Collection ID of ai_reports)* |
| `COPCIVIL_COLLECTION_SECURITY_CONFIG` | *(Collection ID of security_config)* |

**Additional for `copcivil-ai-report` ONLY**:

| Key | Value |
|---|---|
| `OPENROUTER_API_KEY` | *(Your OpenRouter API key)* |

### 0.5 Fill `.env` File

Copy `.env.example` to `.env` and fill in the Copcivil section:

```
# Copcivil Security System
VITE_APPWRITE_DATABASE_SECURITY_ID=<Database ID from 0.1>
VITE_APPWRITE_COLLECTION_INCIDENTS=<security_incidents collection ID>
VITE_APPWRITE_COLLECTION_BLOCKLIST=<ip_blocklist collection ID>
VITE_APPWRITE_COLLECTION_AI_REPORTS=<ai_reports collection ID>
VITE_APPWRITE_COLLECTION_SECURITY_CONFIG=<security_config collection ID>
VITE_APPWRITE_FUNCTION_COPCIVIL_GUARD=<copcivil-guard function ID>
VITE_APPWRITE_FUNCTION_COPCIVIL_AI_REPORT=<copcivil-ai-report function ID>
VITE_APPWRITE_FUNCTION_COPCIVIL_BLOCKLIST=<copcivil-blocklist function ID>
```

### 0.6 Netlify Environment Variables

Go to **Netlify Dashboard** → **Site Settings** → **Environment Variables** → Add:

| Key | Value |
|---|---|
| `APPWRITE_ENDPOINT` | `https://cloud.appwrite.io/v1` |
| `APPWRITE_PROJECT_ID` | *(Your Appwrite project ID)* |
| `COPCIVIL_GUARD_FUNCTION_ID` | *(copcivil-guard function ID)* |
| `APPWRITE_API_KEY` | *(API key from step 0.3)* |

Also add all the `VITE_*` variables from your `.env` to Netlify env vars (Netlify needs them at build time).

---

## Phase 1: Run Existing Unit Tests

Run the 129 existing tests locally to confirm nothing is broken after setup:

```bash
npx vitest run
```

**Expected**: All 129 tests pass (same as Part 6 verification).

---

## Phase 2: Local E2E Testing with `netlify dev`

### 2.1 Start Local Server

```bash
netlify dev
```

This starts the Vite dev server WITH the edge function enabled. Default URL: `http://localhost:8888`

### 2.2 Test Scripts

Run these curl commands against the local server. Each test documents:
- **Test ID** and **Category**
- **Payload** (the malicious input)
- **Expected result** (status code + behavior)

---

#### TEST-01: SQLi — UNION SELECT (HIGH severity, score ≥ 15 → BLOCK)

```bash
curl -v "http://localhost:8888/?q=1'+UNION+SELECT+username,password+FROM+users--"
```

**Expected**: HTTP 403, response body contains `"Request blocked by copcivil security system."`
**Header**: `X-Copcivil-Blocked: true`

---

#### TEST-02: SQLi — DROP TABLE (CRITICAL severity, score ≥ 15 → BLOCK)

```bash
curl -v "http://localhost:8888/?id=1;+DROP+TABLE+users;--"
```

**Expected**: HTTP 403, blocked.

---

#### TEST-03: SQLi — OR 1=1 (MEDIUM severity, single match, score ~4 → LOG only)

```bash
curl -v "http://localhost:8888/?search=or+1%3D1"
```

**Expected**: HTTP 200 (passes through). Score is 4 (medium weight), below warn threshold of 7. No incident logged.

---

#### TEST-04: SQLi — Combined low-score (multiple MEDIUM, score ≥ 7 → WARN)

```bash
curl -v "http://localhost:8888/?q=or+1%3D1+having+1%3D1+order+by+1"
```

**Expected**: HTTP 200 (passes through, but incident logged as "warned"). Score: 4+4+1=9 ≥ 7.

---

#### TEST-05: XSS — Script tag (HIGH+HIGH, score ≥ 14 → WARN or BLOCK)

```bash
curl -v "http://localhost:8888/?name=%3Cscript%3Ealert(1)%3C/script%3E"
```

**Expected**: HTTP 403 blocked. Matches `<script>` (7) + `</script>` (7) + `alert(` (4) = 18 ≥ 15.

---

#### TEST-06: XSS — SVG onload (HIGH, score 7 → WARN)

```bash
curl -v "http://localhost:8888/?img=%3Csvg+onload%3Dalert(1)%3E"
```

**Expected**: HTTP 200 (warned). Matches `<svg onload=` (7) + `alert(` (4) = 11 → warned (7-14).

---

#### TEST-07: XSS — document.cookie theft (CRITICAL, score 10 → WARN)

```bash
curl -v "http://localhost:8888/?payload=document.cookie"
```

**Expected**: HTTP 200 (warned). Score: 10 (single critical match). Between 7-14 → warned.

---

#### TEST-08: XSS — Full cookie theft (CRITICAL+HIGH, score ≥ 15 → BLOCK)

```bash
curl -v "http://localhost:8888/?x=%3Cscript%3Edocument.cookie%3C/script%3E"
```

**Expected**: HTTP 403 blocked. `<script>` (7) + `document.cookie` (10) + `</script>` (7) = 24.

---

#### TEST-09: CMDi — ls command (HIGH, score 7 → WARN)

```bash
curl -v "http://localhost:8888/?cmd=%3B+ls"
```

**Expected**: HTTP 200 (warned). Matches `; ls` (7).

---

#### TEST-10: CMDi — rm file deletion (CRITICAL + HIGH = 17 → BLOCK)

```bash
curl -v "http://localhost:8888/?cmd=%3B+rm+-rf+/+%3B+ls"
```

**Expected**: HTTP 403 blocked. `; rm ` (10) + `; ls` (7) = 17.

---

#### TEST-11: Path Traversal — /etc/passwd (HIGH, score 7 → WARN)

```bash
curl -v "http://localhost:8888/?file=../../../etc/passwd"
```

**Expected**: HTTP 200 (warned). Matches `../../../` (7) + `/etc/passwd` (7) = 14 → warned.

---

#### TEST-12: Path Traversal — Deep traversal + sensitive file (BLOCK)

```bash
curl -v "http://localhost:8888/?file=....//....//....//etc/shadow"
```

**Expected**: HTTP 403 blocked. `....//....//` (7) + `/etc/shadow` (10) = 17+ → blocked.

---

#### TEST-13: Evasion — Double URL encoding

```bash
curl -v "http://localhost:8888/?q=%2527+OR+%25271%2527%253D%25271"
```

**Expected**: Normalizer double-decodes `%2527` → `%27` → `'`. Should detect after normalization.

---

#### TEST-14: Evasion — Mixed case + SQL comments

```bash
curl -v "http://localhost:8888/?q=UnIoN/**/SeLeCt/**/1,2,3"
```

**Expected**: HTTP 403 blocked. Normalizer lowercases + strips SQL comments → `union select 1,2,3`. Score: 7 (high). Combined with other patterns if present.

---

#### TEST-15: Clean request (no payload — should pass through)

```bash
curl -v "http://localhost:8888/"
```

**Expected**: HTTP 200, normal page served. No incident logged.

---

#### TEST-16: Static asset bypass (no scanning)

```bash
curl -v "http://localhost:8888/assets/style.css?q=%3Cscript%3E"
```

**Expected**: HTTP 200, static asset served. Edge function skips scanning for `.css` files.

---

### 2.3 Verify Incidents in Appwrite

After running the tests above:

1. Go to **Appwrite Console** → **Databases** → `copcivil_security` → `security_incidents`
2. Verify documents were created for blocked and warned requests
3. Check fields: `ip_address`, `attack_category`, `severity`, `threat_score`, `action_taken`

---

## Phase 3: Auto-Block Testing

### 3.1 Trigger Auto-Block (5 incidents from same IP)

Run 5+ attack requests rapidly (default: 5 incidents in 10 minutes triggers auto-block):

```bash
# Run these in quick succession (simulates repeated attacker)
for i in {1..6}; do
  curl -s -o /dev/null -w "Request $i: HTTP %{http_code}\n" \
    "http://localhost:8888/?q=union+select+1,2,3"
  sleep 1
done
```

**Expected behavior**:
- Requests 1-5: HTTP 403 (blocked by detection, incidents logged)
- After 5th incident: IP gets auto-blocked in `ip_blocklist` collection
- Request 6: HTTP 403 (blocked by IP blocklist check, not by detection)

### 3.2 Verify Auto-Block in Database

1. Check `ip_blocklist` collection → new document with:
   - `ip_address`: `127.0.0.1` (or your local IP)
   - `block_type`: `auto`
   - `status`: `active`
   - `reason`: `Auto-blocked: 5 incidents in 10 minutes` (approx)
   - `expires_at`: 24 hours from now

### 3.3 Verify Blocked IP Gets 403 on Clean Requests

```bash
# This is a clean request but should be blocked because IP is in blocklist
curl -v "http://localhost:8888/"
```

**Expected**: HTTP 403 even for a clean request (IP is blocked).

### 3.4 Clean Up — Remove Your IP from Blocklist

Use the Appwrite Console to manually delete the blocklist document for your IP, or run:

```bash
# Via the blocklist function (if testing against Netlify)
curl -X POST "https://YOUR-SITE.netlify.app/.netlify/functions/copcivil-blocklist/unblock" \
  -H "Content-Type: application/json" \
  -d '{"ip_address": "127.0.0.1"}'
```

Or simply delete the document from Appwrite Console.

---

## Phase 4: Deploy to Netlify & Live E2E Testing

### 4.1 Deploy

```bash
git add -A && git commit -m "chore: pre-production testing config"
git push origin main
```

Netlify auto-deploys. Wait for build to succeed.

### 4.2 Live Tests

Repeat the curl tests from Phase 2, replacing `http://localhost:8888` with your Netlify URL:

```bash
SITE="https://YOUR-SITE.netlify.app"

# SQLi BLOCK test
curl -v "$SITE/?q=1'+UNION+SELECT+username,password+FROM+users--"

# XSS BLOCK test
curl -v "$SITE/?name=%3Cscript%3Ealert(1)%3C/script%3E"

# CMDi BLOCK test
curl -v "$SITE/?cmd=%3B+rm+-rf+/"

# Path Traversal BLOCK test
curl -v "$SITE/?file=....//....//....//etc/shadow"

# Clean request PASS test
curl -v "$SITE/"
```

### 4.3 Verify Edge Function Logs

Go to **Netlify Dashboard** → **Functions** → **Edge Functions** → check logs for copcivil-edge activity.

---

## Phase 5: Dashboard Verification

### 5.1 Login as Admin

1. Open your site in browser
2. Login with your admin account
3. Navigate to the Security section in the sidebar

### 5.2 Security Dashboard Page

**Verify**:
- [ ] Total incidents (24h) stat card shows correct count
- [ ] Blocked attacks stat card shows correct count
- [ ] Active blocked IPs stat card shows correct count
- [ ] Category pie chart shows distribution (SQLi, XSS, CMDi, Path Traversal)
- [ ] Recent incidents table shows the test incidents

### 5.3 Incident Log Page

**Verify**:
- [ ] Incidents table lists all test incidents
- [ ] Filters work: filter by category (sqli), severity (critical), action (blocked)
- [ ] Expandable row shows full incident details (matched patterns, headers, etc.)
- [ ] Pagination works if > 25 incidents
- [ ] IP search works

### 5.4 Blocklist Page

**Verify**:
- [ ] Auto-blocked IPs appear in the list
- [ ] Manual block: click "Blokir IP" button, enter an IP + reason → verify it appears
- [ ] Unblock: click unblock on a blocked IP → verify status changes
- [ ] Status filter works (active/expired/whitelisted)
- [ ] Cleanup button expires old auto-blocks

### 5.5 AI Reports Page

**Verify**:
- [ ] Click "Generate Report" with a time range that includes your test incidents
- [ ] Report generates successfully (may take 10-30 seconds)
- [ ] Report card shows summary, model used, timestamp
- [ ] Click report card to expand → full summary + recommendations visible
- [ ] Stats JSON is populated with correct breakdown

### 5.6 Security Config Page

**Verify**:
- [ ] All 4 sections render (Thresholds, Auto-block, AI, Whitelist)
- [ ] Values match the defaults inserted in Phase 0
- [ ] Edit a value → "Simpan" button enables → save → verify in Appwrite Console
- [ ] Dirty tracking works (unsaved changes indicator)

---

## Phase 6: Edge Cases & Negative Tests

### 6.1 Admin Whitelist Self-Protection

1. Go to Security Config → add your IP to `admin_whitelist_ips`
2. Save
3. Run attack payloads from that IP → should NOT be auto-blocked (whitelisted)

### 6.2 Rate Limit on AI Reports

1. Generate a report
2. Immediately try to generate another
3. **Expected**: Error message "Rate limited. Max 1 report per 5 minutes."

### 6.3 Empty State

1. Clear all incidents from the database (or use a fresh time range)
2. Generate a report → should return "No incidents found in the specified period."
3. Dashboard should show 0 for all stats, empty pie chart

---

## Test Results Documentation Template

For thesis documentation, record each test in this format:

| Test ID | Category | Payload | Expected | Actual | Status | Screenshot |
|---|---|---|---|---|---|---|
| TEST-01 | SQLi | `UNION SELECT` | 403 Blocked | | ✅/❌ | |
| TEST-02 | SQLi | `DROP TABLE` | 403 Blocked | | ✅/❌ | |
| ... | | | | | | |

---

## Troubleshooting

### Edge function not detecting payloads
- Check Netlify env vars are set (`APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, etc.)
- Check `netlify dev` console for errors
- Verify payload patterns are loaded (check `copcivil/payloads/*.json`)

### Incidents not appearing in database
- Check Appwrite Function logs for errors
- Verify collection permissions allow create
- Verify env vars in Appwrite Function settings match collection IDs

### Dashboard shows empty data
- Verify `.env` has correct `VITE_APPWRITE_DATABASE_SECURITY_ID` and collection IDs
- Check browser console for Appwrite SDK errors
- Verify you're logged in as admin

### AI report fails
- Check `OPENROUTER_API_KEY` is set in `copcivil-ai-report` function env vars
- Check OpenRouter account has credits
- Check Appwrite Function logs for the error message
