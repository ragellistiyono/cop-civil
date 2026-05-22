# Copcivil Security Admin Dashboard — Frontend Design Spec

**Date**: 2026-04-29
**Scope**: Admin-only security dashboard integrated into the existing CIVIL QTRACK admin panel
**Depends On**: Backend Parts 1–4 (detection engine, payloads, Appwrite Functions, edge function)

---

## 1. Overview

A 5-page security admin dashboard nested under the existing `/admin` panel. Provides visibility into detected attacks, IP blocking management, AI-generated analytics, and system configuration. All pages are admin-only (protected by existing `ProtectedRoute adminOnly`).

### Pages

| Page | Route | Purpose |
|---|---|---|
| Ringkasan Keamanan | `/admin/security` | Overview stats, category chart, recent incidents |
| Log Insiden | `/admin/security/incidents` | Filterable/paginated incident log |
| Daftar Blokir IP | `/admin/security/blocklist` | IP blocklist CRUD |
| Laporan AI | `/admin/security/ai-reports` | Generate and view AI analytics reports |
| Konfigurasi | `/admin/security/config` | Adjust thresholds, whitelist, AI model |

### UI Language

Indonesian for all labels, headings, buttons, and messages. Technical terms (SQL Injection, XSS, etc.) remain in English as they are industry-standard.

---

## 2. Navigation Integration

The existing `AdminSidebar` gets a new expandable **"Keamanan"** menu group using the `Shield` icon from Lucide. It expands/collapses on click to show 5 sub-links:

```
Existing items:
  📊 Dashboard           → /admin/dashboard
  👥 Manajemen User      → /admin/users
  📄 Manajemen Kontrak   → /admin/kontrak
  📋 Laporan Inspeksi    → /admin/inspeksi
  🔔 Notifikasi          → /admin/notifikasi

New expandable group:
  🛡️ Keamanan            → toggles sub-menu
     ├── Ringkasan       → /admin/security
     ├── Log Insiden      → /admin/security/incidents
     ├── Daftar Blokir   → /admin/security/blocklist
     ├── Laporan AI      → /admin/security/ai-reports
     └── Konfigurasi     → /admin/security/config
```

The group auto-expands when the current route starts with `/admin/security`. Active sub-item gets the existing `.active` highlight style. The expand/collapse state uses a `ChevronDown`/`ChevronRight` Lucide icon.

### Files Modified

- `src/components/admin/AdminSidebar.jsx` — add expandable security group
- `src/components/admin/AdminLayout.jsx` — add security routes to `PAGE_TITLES` map

### Files Created

- `src/components/admin/security/SecuritySidebarGroup.jsx` — expandable menu group component

---

## 3. Routing

New routes nested under the existing `/admin` layout in `App.jsx`:

```jsx
<Route path="security" element={<SecurityDashboardPage />} />
<Route path="security/incidents" element={<IncidentLogPage />} />
<Route path="security/blocklist" element={<BlocklistPage />} />
<Route path="security/ai-reports" element={<AiReportPage />} />
<Route path="security/config" element={<SecurityConfigPage />} />
```

All routes inherit the existing `ProtectedRoute adminOnly` wrapper from the parent `/admin` route.

---

## 4. Data Access Strategy

**Hybrid approach** — direct DB queries for reads (rich filtering/pagination), Appwrite Function execution for writes (server-side validation).

| Operation | Method | Target |
|---|---|---|
| List/filter/count incidents | `databases.listDocuments()` | `security_incidents` collection |
| List blocked IPs | `databases.listDocuments()` | `ip_blocklist` collection |
| Block IP (manual) | `functions.createExecution()` | `copcivil-blocklist` (xpath: `/block`, method: `POST`) |
| Unblock IP | `functions.createExecution()` | `copcivil-blocklist` (xpath: `/unblock`, method: `POST`) |
| Cleanup expired blocks | `functions.createExecution()` | `copcivil-blocklist` (xpath: `/cleanup`, method: `POST`) |
| List AI reports | `databases.listDocuments()` | `ai_reports` collection |
| Generate AI report | `functions.createExecution()` | `copcivil-ai-report` (xpath: `/generate`, method: `POST`) |
| Read config | `databases.listDocuments()` | `security_config` collection |
| Update config | `databases.updateDocument()` | `security_config` collection |

### Environment Variables Used (Frontend)

All from `.env.example` — already defined in backend Part 3:

- `VITE_APPWRITE_DATABASE_SECURITY_ID` — security database ID
- `VITE_APPWRITE_COLLECTION_INCIDENTS` — incidents collection
- `VITE_APPWRITE_COLLECTION_BLOCKLIST` — blocklist collection
- `VITE_APPWRITE_COLLECTION_AI_REPORTS` — AI reports collection
- `VITE_APPWRITE_COLLECTION_SECURITY_CONFIG` — config collection
- `VITE_APPWRITE_FUNCTION_COPCIVIL_BLOCKLIST` — blocklist function ID
- `VITE_APPWRITE_FUNCTION_COPCIVIL_AI_REPORT` — AI report function ID

---

## 5. Hooks

### 5.1 `useIncidents()`

Wraps `databases.listDocuments()` for the incidents collection.

**Returns:** `{ incidents, total, loading, error, fetchIncidents, fetchStats }`

- `fetchIncidents({ page, limit, category, severity, action, ip, dateFrom, dateTo })` — paginated + filtered list
- `fetchStats()` — returns `{ total24h, blocked24h, categoryBreakdown }` by running count queries

### 5.2 `useBlocklist()`

Hybrid: reads via DB, writes via function execution.

**Returns:** `{ blocklist, total, loading, error, fetchBlocklist, blockIp, unblockIp, cleanupExpired }`

- `fetchBlocklist({ page, limit, status })` — paginated list from DB
- `blockIp({ ip_address, reason, expires_at })` — calls `copcivil-blocklist /block`
- `unblockIp({ ip_address, whitelist })` — calls `copcivil-blocklist /unblock`
- `cleanupExpired()` — calls `copcivil-blocklist /cleanup`

> **SDK quirk (Appwrite web SDK v18+):** `functions.createExecution()` uses the property name `xpath`, not `path`. Also use `ExecutionMethod.POST` enum (imported from `'appwrite'`) instead of the raw string `'POST'`. The official Appwrite docs still show `path` — that is incorrect for current SDK versions and the SDK silently drops unknown properties, causing the function to receive default `path: /` and return `Route not found`.

### 5.3 `useAiReports()`

**Returns:** `{ reports, loading, error, generating, fetchReports, generateReport }`

- `fetchReports({ page, limit })` — paginated list from DB
- `generateReport({ periodStart, periodEnd })` — calls `copcivil-ai-report /generate`
- `generating` — separate boolean for the generation in-progress state

### 5.4 `useSecurityConfig()`

Direct DB reads and writes for the `security_config` collection.

**Returns:** `{ config, loading, error, fetchConfig, updateConfig }`

- `fetchConfig()` — loads all config key-value pairs into an object
- `updateConfig(key, value)` — finds the document where `key` field matches, then updates its `value` field

---

## 6. Page Designs

### 6.1 Ringkasan Keamanan (`SecurityDashboardPage`)

Layout (top to bottom):

1. **Stat cards row** — 3 cards side by side:
   - "Total Insiden (24 Jam)" — number, with severity color accent
   - "Serangan Diblokir (24 Jam)" — number, red accent
   - "IP Diblokir Aktif" — number, orange accent

2. **Distribusi Kategori Serangan** — Recharts `PieChart` showing incident count per category (SQLi, XSS, CMDi, Path Traversal). Legend below chart. Uses category colors.

3. **Insiden Terbaru** — Simple table, last 5 incidents:
   - Columns: Waktu, IP, Kategori, Tingkat, Aksi
   - Severity shown as colored badge
   - "Lihat Semua →" link to `/admin/security/incidents`

### 6.2 Log Insiden (`IncidentLogPage`)

1. **Filter bar** — horizontal row:
   - Text input: search by IP address
   - Select: Kategori (semua / sqli / xss / cmdi / path_traversal)
   - Select: Tingkat Keparahan (semua / critical / high / medium / low)
   - Select: Aksi (semua / blocked / warned / logged)
   - "Terapkan" button

2. **Results table**:
   - Columns: Waktu, IP, Kategori, Tingkat, Skor, Aksi, Layer
   - Severity as colored badge, action as colored badge
   - Click row → expandable detail section showing:
     - URL lengkap
     - Pola terdeteksi (list of pattern IDs)
     - User Agent
     - Cuplikan body

3. **Pagination** — bottom of table, 25 per page, previous/next + page indicator

### 6.3 Daftar Blokir IP (`BlocklistPage`)

1. **Header row**:
   - "Blokir IP" button (opens modal)
   - "Bersihkan Kadaluarsa" button
   - Filter: Status (aktif / kadaluarsa / semua)

2. **Blocklist table**:
   - Columns: IP, Alasan, Tipe (auto/manual badge), Diblokir Pada, Kadaluarsa, Status
   - Action column: "Buka Blokir" button per active row

3. **Block IP Modal** (`BlockIpModal`):
   - IP Address input (required)
   - Alasan textarea (required)
   - Kadaluarsa datetime input (optional, null = permanent)
   - "Blokir" + "Batal" buttons

4. **Pagination** — 25 per page

### 6.4 Laporan AI (`AiReportPage`)

1. **Header**: "Buat Laporan" button (triggers generation)
   - On click: shows date range picker (periode awal/akhir), then confirm
   - While generating: button shows spinner + "Membuat laporan..." disabled state

2. **Reports list** — card layout:
   - Tanggal dibuat, Tipe (periodik/on-demand badge), Model LLM, Ringkasan (truncated preview)
   - Click → navigates to detail view (same page, conditional render)

3. **Report detail view** (shown when a report is selected):
   - Back button
   - Full summary text
   - Rekomendasi section
   - Statistik section (parsed from `stats_json`, rendered as key-value pairs or simple table)
   - Metadata: model used, period, generated at

### 6.5 Konfigurasi Keamanan (`SecurityConfigPage`)

Single form with grouped sections:

**Ambang Batas Deteksi:**
- Ambang blokir (number input, default 15)
- Ambang peringatan (number input, default 7)

**Auto-Blokir:**
- Jumlah insiden untuk auto-blokir (number, default 5)
- Jendela waktu (menit) (number, default 10)
- Durasi blokir (jam) (number, default 24)

**AI Analytics:**
- Model OpenRouter (text input, default "anthropic/claude-sonnet-4")

**IP Whitelist:**
- Textarea, one IP per line
- Helper text: "IP dalam daftar ini tidak akan diblokir secara otomatis"

**Save button**: "Simpan Konfigurasi" — saves all changed values

---

## 7. Components

### Shared Components (reusable across security pages)

| Component | File | Purpose |
|---|---|---|
| `StatCard` | `components/admin/security/StatCard.jsx` | Metric card with label, value, accent color |
| `SeverityBadge` | `components/admin/security/SeverityBadge.jsx` | Colored badge for critical/high/medium/low |
| `ActionBadge` | `components/admin/security/ActionBadge.jsx` | Colored badge for blocked/warned/logged |
| `CategoryBadge` | `components/admin/security/CategoryBadge.jsx` | Badge for sqli/xss/cmdi/path_traversal |

### Page-Specific Components

| Component | File | Used By |
|---|---|---|
| `SecuritySidebarGroup` | `components/admin/security/SecuritySidebarGroup.jsx` | AdminSidebar |
| `CategoryPieChart` | `components/admin/security/CategoryPieChart.jsx` | SecurityDashboardPage |
| `IncidentTable` | `components/admin/security/IncidentTable.jsx` | IncidentLogPage |
| `IncidentDetailRow` | `components/admin/security/IncidentDetailRow.jsx` | IncidentTable |
| `IncidentFilters` | `components/admin/security/IncidentFilters.jsx` | IncidentLogPage |
| `BlocklistTable` | `components/admin/security/BlocklistTable.jsx` | BlocklistPage |
| `BlockIpModal` | `components/admin/security/BlockIpModal.jsx` | BlocklistPage |
| `AiReportCard` | `components/admin/security/AiReportCard.jsx` | AiReportPage |
| `AiReportDetail` | `components/admin/security/AiReportDetail.jsx` | AiReportPage |
| `SecurityConfigForm` | `components/admin/security/SecurityConfigForm.jsx` | SecurityConfigPage |

---

## 8. Styling

### Approach

- Vanilla CSS, following existing admin panel conventions
- All security-specific classes prefixed with `.security-` 
- Added to a single new CSS file: `src/styles/security.css` (imported in `main.jsx`)

### Severity Color Variables

```css
:root {
  --severity-critical: #dc2626;
  --severity-high: #ea580c;
  --severity-medium: #ca8a04;
  --severity-low: #6b7280;
  --action-blocked: #dc2626;
  --action-warned: #ea580c;
  --action-logged: #6b7280;
  --category-sqli: #3b82f6;
  --category-xss: #8b5cf6;
  --category-cmdi: #ef4444;
  --category-path-traversal: #f59e0b;
}
```

### Responsive Behavior

- Stat cards: 3 columns on desktop, stacked on mobile (< 768px)
- Tables: horizontal scroll on small screens
- Filter bar: wraps on mobile
- Modal: full-width on mobile, 480px max on desktop

---

## 9. Dependencies

| Package | Version | Purpose |
|---|---|---|
| `recharts` | ^2.x | Pie chart on dashboard overview |

No other new dependencies. Uses existing: React 19, React Router 7, Appwrite SDK, Lucide React.

---

## 10. File Structure Summary

```
src/
├── hooks/
│   ├── useIncidents.js
│   ├── useBlocklist.js
│   ├── useAiReports.js
│   └── useSecurityConfig.js
├── components/admin/security/
│   ├── SecuritySidebarGroup.jsx
│   ├── StatCard.jsx
│   ├── SeverityBadge.jsx
│   ├── ActionBadge.jsx
│   ├── CategoryBadge.jsx
│   ├── CategoryPieChart.jsx
│   ├── IncidentTable.jsx
│   ├── IncidentDetailRow.jsx
│   ├── IncidentFilters.jsx
│   ├── BlocklistTable.jsx
│   ├── BlockIpModal.jsx
│   ├── AiReportCard.jsx
│   ├── AiReportDetail.jsx
│   └── SecurityConfigForm.jsx
├── pages/admin/
│   ├── SecurityDashboardPage.jsx
│   ├── IncidentLogPage.jsx
│   ├── BlocklistPage.jsx
│   ├── AiReportPage.jsx
│   └── SecurityConfigPage.jsx
├── styles/
│   └── security.css
└── App.jsx (modified — add security routes)
```

Modified existing files:
- `src/components/admin/AdminSidebar.jsx` — integrate SecuritySidebarGroup
- `src/components/admin/AdminLayout.jsx` — add security page titles
- `src/App.jsx` — add security routes
- `src/main.jsx` — import security.css

---

## 11. Scope Boundaries

### In scope
- 5 security admin pages with full CRUD
- Integration with 3 existing Appwrite Functions
- Direct DB reads for incidents, reports, config
- Recharts pie chart on overview
- Expandable sidebar navigation group
- Responsive CSS
- Indonesian UI labels

### Out of scope
- Real-time updates (WebSocket/SSE)
- Export to CSV/PDF
- Email notifications for incidents
- Multi-language support
- Dark mode customization (uses existing theme system)
- E2E tests (manual testing for thesis demo)
