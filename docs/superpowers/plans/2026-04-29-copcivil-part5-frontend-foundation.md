# Copcivil Part 5: Frontend Foundation — Hooks, Components, Navigation, Routing

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the frontend foundation for the security admin dashboard — custom hooks for API access, reusable badge/card components, expandable sidebar navigation, routing, and CSS styling.

**Architecture:** Custom React hooks wrap Appwrite SDK calls (direct DB for reads, function execution for writes). Shared badge components provide consistent severity/action/category styling. An expandable sidebar group integrates into the existing admin panel. All security routes are nested under `/admin/security/*`.

**Tech Stack:** React 19, React Router 7, Appwrite SDK v24, Lucide React, Recharts, Vitest, vanilla CSS.

**Spec Reference:** `docs/superpowers/specs/2026-04-29-copcivil-frontend-dashboard-design.md`

**Depends On:** Parts 1–4 (all backend complete)

---

## File Structure

```
src/
├── hooks/
│   ├── useIncidents.js          # Fetch/filter/count incidents from DB
│   ├── useBlocklist.js           # Blocklist: DB reads + function writes
│   ├── useAiReports.js           # AI reports: DB reads + function writes
│   └── useSecurityConfig.js      # Config: DB reads + DB writes
├── components/admin/security/
│   ├── SecuritySidebarGroup.jsx  # Expandable sidebar menu group
│   ├── StatCard.jsx              # Metric card (label, value, accent)
│   ├── SeverityBadge.jsx         # Badge for critical/high/medium/low
│   ├── ActionBadge.jsx           # Badge for blocked/warned/logged
│   └── CategoryBadge.jsx         # Badge for sqli/xss/cmdi/path_traversal
├── pages/admin/
│   ├── SecurityDashboardPage.jsx # Skeleton (placeholder for Part 6)
│   ├── IncidentLogPage.jsx       # Skeleton
│   ├── BlocklistPage.jsx         # Skeleton
│   ├── AiReportPage.jsx          # Skeleton
│   └── SecurityConfigPage.jsx    # Skeleton
└── styles/
    └── security.css              # All security-specific styles
```

Also modifies:
- `src/App.jsx` — add 5 security routes
- `src/main.jsx` — import security.css
- `src/components/admin/AdminSidebar.jsx` — integrate SecuritySidebarGroup
- `src/components/admin/AdminLayout.jsx` — add security page titles
- `package.json` — add recharts dependency

---

### Task 1: Install Recharts + Create CSS Foundation

**Files:**
- Modify: `package.json`
- Create: `src/styles/security.css`
- Modify: `src/main.jsx`

- [ ] **Step 1: Install recharts**

Run:
```bash
npm install recharts
```

- [ ] **Step 2: Create security.css**

Create `src/styles/security.css`:
```css
/* ==============================================
   Copcivil Security Dashboard Styles
   ============================================== */

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

/* --- Stat Cards --- */
.security-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.security-stat-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.security-stat-card-label {
  font-size: 0.85rem;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
}

.security-stat-card-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.security-stat-card-accent {
  width: 4px;
  height: 100%;
  border-radius: 2px;
  position: absolute;
  left: 0;
  top: 0;
}

/* --- Badges --- */
.security-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.security-badge--critical {
  background: #fef2f2;
  color: var(--severity-critical);
}
.security-badge--high {
  background: #fff7ed;
  color: var(--severity-high);
}
.security-badge--medium {
  background: #fefce8;
  color: var(--severity-medium);
}
.security-badge--low {
  background: #f3f4f6;
  color: var(--severity-low);
}
.security-badge--blocked {
  background: #fef2f2;
  color: var(--action-blocked);
}
.security-badge--warned {
  background: #fff7ed;
  color: var(--action-warned);
}
.security-badge--logged {
  background: #f3f4f6;
  color: var(--action-logged);
}
.security-badge--sqli {
  background: #eff6ff;
  color: var(--category-sqli);
}
.security-badge--xss {
  background: #f5f3ff;
  color: var(--category-xss);
}
.security-badge--cmdi {
  background: #fef2f2;
  color: var(--category-cmdi);
}
.security-badge--path_traversal {
  background: #fffbeb;
  color: var(--category-path-traversal);
}

/* --- Sidebar Group --- */
.security-sidebar-group {
  display: flex;
  flex-direction: column;
}

.security-sidebar-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s;
}

.security-sidebar-toggle:hover {
  background: var(--sidebar-hover, rgba(0, 0, 0, 0.05));
}

.security-sidebar-toggle.active {
  color: var(--primary, #3b82f6);
}

.security-sidebar-toggle-chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

.security-sidebar-toggle-chevron.expanded {
  transform: rotate(90deg);
}

.security-sidebar-subitems {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.25s ease;
}

.security-sidebar-subitems.expanded {
  max-height: 300px;
}

.security-sidebar-subitem {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #6b7280);
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}

.security-sidebar-subitem:hover {
  background: var(--sidebar-hover, rgba(0, 0, 0, 0.05));
  color: var(--text-primary, #1f2937);
}

.security-sidebar-subitem.active {
  background: var(--primary-light, #eff6ff);
  color: var(--primary, #3b82f6);
  font-weight: 600;
}

/* --- Tables --- */
.security-table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  background: var(--card-bg, #fff);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.security-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.security-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
  border-bottom: 1px solid var(--border, #e5e7eb);
  white-space: nowrap;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.security-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-light, #f3f4f6);
  vertical-align: middle;
}

.security-table tr:last-child td {
  border-bottom: none;
}

.security-table tr.clickable {
  cursor: pointer;
  transition: background 0.15s;
}

.security-table tr.clickable:hover {
  background: var(--row-hover, #f9fafb);
}

/* --- Filters --- */
.security-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: flex-end;
}

.security-filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.security-filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.security-filter-group input,
.security-filter-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #1f2937);
  min-width: 140px;
}

.security-filter-group input:focus,
.security-filter-group select:focus {
  outline: none;
  border-color: var(--primary, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

/* --- Buttons --- */
.security-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.15s, opacity 0.15s;
}

.security-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.security-btn--primary {
  background: var(--primary, #3b82f6);
  color: #fff;
}

.security-btn--primary:hover:not(:disabled) {
  background: var(--primary-dark, #2563eb);
}

.security-btn--danger {
  background: var(--severity-critical);
  color: #fff;
}

.security-btn--danger:hover:not(:disabled) {
  background: #b91c1c;
}

.security-btn--secondary {
  background: var(--border, #e5e7eb);
  color: var(--text-primary, #1f2937);
}

.security-btn--secondary:hover:not(:disabled) {
  background: #d1d5db;
}

.security-btn--ghost {
  background: transparent;
  color: var(--text-secondary, #6b7280);
}

.security-btn--ghost:hover:not(:disabled) {
  background: var(--row-hover, #f9fafb);
  color: var(--text-primary, #1f2937);
}

/* --- Pagination --- */
.security-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #6b7280);
}

.security-pagination-buttons {
  display: flex;
  gap: 0.5rem;
}

/* --- Modal --- */
.security-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.security-modal {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.security-modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.security-modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* --- Form --- */
.security-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.security-form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.security-form-group input,
.security-form-group textarea,
.security-form-group select {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #1f2937);
}

.security-form-group input:focus,
.security-form-group textarea:focus,
.security-form-group select:focus {
  outline: none;
  border-color: var(--primary, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.security-form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.security-form-helper {
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
}

.security-form-section {
  margin-bottom: 2rem;
}

.security-form-section-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-light, #f3f4f6);
}

/* --- Page Layout --- */
.security-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.security-page-header-actions {
  display: flex;
  gap: 0.5rem;
}

/* --- Detail Row (expandable) --- */
.security-detail-row {
  background: var(--row-hover, #f9fafb);
}

.security-detail-content {
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  font-size: 0.85rem;
}

.security-detail-item label {
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
  display: block;
  font-size: 0.75rem;
  margin-bottom: 0.2rem;
}

.security-detail-item span {
  word-break: break-all;
}

/* --- Chart Section --- */
.security-chart-section {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.security-chart-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

/* --- Report Card --- */
.security-report-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: box-shadow 0.15s;
  margin-bottom: 0.75rem;
}

.security-report-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.security-report-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.security-report-card-date {
  font-size: 0.8rem;
  color: var(--text-secondary, #6b7280);
}

.security-report-card-summary {
  font-size: 0.875rem;
  color: var(--text-primary, #1f2937);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* --- Loading & Error --- */
.security-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary, #6b7280);
  font-size: 0.9rem;
}

.security-error {
  background: #fef2f2;
  color: var(--severity-critical);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.security-empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary, #6b7280);
  font-size: 0.9rem;
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .security-stats-row {
    grid-template-columns: 1fr;
  }

  .security-detail-content {
    grid-template-columns: 1fr;
  }

  .security-modal {
    max-width: 100%;
  }
}
```

- [ ] **Step 3: Import security.css in main.jsx**

In `src/main.jsx`, add the import alongside existing CSS imports:

Find the existing CSS import line(s) and add below:
```javascript
import './styles/security.css'
```

- [ ] **Step 4: Verify dev server runs**

Run:
```bash
npm run dev
```

Expected: Dev server starts without errors. No visual changes yet.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/styles/security.css src/main.jsx
git commit -m "chore: add recharts dependency + security CSS foundation"
```

---

### Task 2: Shared Badge Components

**Files:**
- Create: `src/components/admin/security/SeverityBadge.jsx`
- Create: `src/components/admin/security/ActionBadge.jsx`
- Create: `src/components/admin/security/CategoryBadge.jsx`
- Create: `src/components/admin/security/StatCard.jsx`

- [ ] **Step 1: Create SeverityBadge**

Create `src/components/admin/security/SeverityBadge.jsx`:
```jsx
const SEVERITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export default function SeverityBadge({ severity }) {
  const label = SEVERITY_LABELS[severity] || severity;
  return (
    <span className={`security-badge security-badge--${severity}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Create ActionBadge**

Create `src/components/admin/security/ActionBadge.jsx`:
```jsx
const ACTION_LABELS = {
  blocked: 'Diblokir',
  warned: 'Diperingatkan',
  logged: 'Dicatat',
};

export default function ActionBadge({ action }) {
  const label = ACTION_LABELS[action] || action;
  return (
    <span className={`security-badge security-badge--${action}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 3: Create CategoryBadge**

Create `src/components/admin/security/CategoryBadge.jsx`:
```jsx
const CATEGORY_LABELS = {
  sqli: 'SQL Injection',
  xss: 'XSS',
  cmdi: 'Command Injection',
  path_traversal: 'Path Traversal',
};

export default function CategoryBadge({ category }) {
  const label = CATEGORY_LABELS[category] || category;
  return (
    <span className={`security-badge security-badge--${category}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 4: Create StatCard**

Create `src/components/admin/security/StatCard.jsx`:
```jsx
export default function StatCard({ label, value, color }) {
  return (
    <div className="security-stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <span className="security-stat-card-label">{label}</span>
      <span className="security-stat-card-value" style={{ color }}>
        {value ?? '—'}
      </span>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/security/
git commit -m "feat(copcivil): add shared security badge and stat card components"
```

---

### Task 3: Custom Hooks — useIncidents + useBlocklist

**Files:**
- Create: `src/hooks/useIncidents.js`
- Create: `src/hooks/useBlocklist.js`

- [ ] **Step 1: Create useIncidents hook**

Create `src/hooks/useIncidents.js`:
```javascript
import { useState, useCallback } from 'react';
import { databases } from '../lib/appwrite.js';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_SECURITY_ID;
const COL_INCIDENTS = import.meta.env.VITE_APPWRITE_COLLECTION_INCIDENTS;

export function useIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIncidents = useCallback(async ({
    page = 1,
    limit = 25,
    category = '',
    severity = '',
    action = '',
    ip = '',
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.orderDesc('timestamp'),
        Query.limit(limit),
        Query.offset((page - 1) * limit),
      ];

      if (category) queries.push(Query.equal('attack_category', category));
      if (severity) queries.push(Query.equal('severity', severity));
      if (action) queries.push(Query.equal('action_taken', action));
      if (ip) queries.push(Query.search('ip_address', ip));

      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_INCIDENTS,
        queries,
      });

      setIncidents(result.documents);
      setTotal(result.total);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [allResult, blockedResult] = await Promise.all([
        databases.listDocuments({
          databaseId: DB_ID,
          collectionId: COL_INCIDENTS,
          queries: [
            Query.greaterThan('timestamp', since24h),
            Query.limit(1),
          ],
        }),
        databases.listDocuments({
          databaseId: DB_ID,
          collectionId: COL_INCIDENTS,
          queries: [
            Query.greaterThan('timestamp', since24h),
            Query.equal('action_taken', 'blocked'),
            Query.limit(1),
          ],
        }),
      ]);

      const categoryQueries = ['sqli', 'xss', 'cmdi', 'path_traversal'];
      const categoryResults = await Promise.all(
        categoryQueries.map((cat) =>
          databases.listDocuments({
            databaseId: DB_ID,
            collectionId: COL_INCIDENTS,
            queries: [
              Query.greaterThan('timestamp', since24h),
              Query.equal('attack_category', cat),
              Query.limit(1),
            ],
          })
        )
      );

      const categoryBreakdown = {};
      categoryQueries.forEach((cat, i) => {
        categoryBreakdown[cat] = categoryResults[i].total;
      });

      return {
        total24h: allResult.total,
        blocked24h: blockedResult.total,
        categoryBreakdown,
      };
    } catch (err) {
      console.warn('[useIncidents] fetchStats failed:', err.message);
      return { total24h: 0, blocked24h: 0, categoryBreakdown: {} };
    }
  }, []);

  return { incidents, total, loading, error, fetchIncidents, fetchStats };
}
```

- [ ] **Step 2: Create useBlocklist hook**

Create `src/hooks/useBlocklist.js`:
```javascript
import { useState, useCallback } from 'react';
import { databases, functions } from '../lib/appwrite.js';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_SECURITY_ID;
const COL_BLOCKLIST = import.meta.env.VITE_APPWRITE_COLLECTION_BLOCKLIST;
const FN_BLOCKLIST = import.meta.env.VITE_APPWRITE_FUNCTION_COPCIVIL_BLOCKLIST;

export function useBlocklist() {
  const [blocklist, setBlocklist] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlocklist = useCallback(async ({
    page = 1,
    limit = 25,
    status = 'active',
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.orderDesc('blocked_at'),
        Query.limit(limit),
        Query.offset((page - 1) * limit),
      ];

      if (status && status !== 'semua') {
        queries.push(Query.equal('status', status));
      }

      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_BLOCKLIST,
        queries,
      });

      setBlocklist(result.documents);
      setTotal(result.total);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveCount = useCallback(async () => {
    try {
      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_BLOCKLIST,
        queries: [Query.equal('status', 'active'), Query.limit(1)],
      });
      return result.total;
    } catch {
      return 0;
    }
  }, []);

  const blockIp = useCallback(async ({ ip_address, reason, expires_at }) => {
    setError(null);
    try {
      const execution = await functions.createExecution({
        functionId: FN_BLOCKLIST,
        body: JSON.stringify({ ip_address, reason, expires_at }),
        path: '/block',
        method: 'POST',
      });

      const response = JSON.parse(execution.responseBody);
      if (response.error) throw new Error(response.error);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const unblockIp = useCallback(async ({ ip_address, whitelist = false }) => {
    setError(null);
    try {
      const execution = await functions.createExecution({
        functionId: FN_BLOCKLIST,
        body: JSON.stringify({ ip_address, whitelist }),
        path: '/unblock',
        method: 'POST',
      });

      const response = JSON.parse(execution.responseBody);
      if (response.error) throw new Error(response.error);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const cleanupExpired = useCallback(async () => {
    setError(null);
    try {
      const execution = await functions.createExecution({
        functionId: FN_BLOCKLIST,
        body: '',
        path: '/cleanup',
        method: 'POST',
      });

      const response = JSON.parse(execution.responseBody);
      if (response.error) throw new Error(response.error);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    blocklist, total, loading, error,
    fetchBlocklist, fetchActiveCount, blockIp, unblockIp, cleanupExpired,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useIncidents.js src/hooks/useBlocklist.js
git commit -m "feat(copcivil): add useIncidents and useBlocklist hooks"
```

---

### Task 4: Custom Hooks — useAiReports + useSecurityConfig

**Files:**
- Create: `src/hooks/useAiReports.js`
- Create: `src/hooks/useSecurityConfig.js`

- [ ] **Step 1: Create useAiReports hook**

Create `src/hooks/useAiReports.js`:
```javascript
import { useState, useCallback } from 'react';
import { databases, functions } from '../lib/appwrite.js';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_SECURITY_ID;
const COL_REPORTS = import.meta.env.VITE_APPWRITE_COLLECTION_AI_REPORTS;
const FN_AI_REPORT = import.meta.env.VITE_APPWRITE_FUNCTION_COPCIVIL_AI_REPORT;

export function useAiReports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async ({ page = 1, limit = 10 } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_REPORTS,
        queries: [
          Query.orderDesc('generated_at'),
          Query.limit(limit),
          Query.offset((page - 1) * limit),
        ],
      });

      setReports(result.documents);
      setTotal(result.total);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async ({ periodStart, periodEnd }) => {
    setGenerating(true);
    setError(null);
    try {
      const execution = await functions.createExecution({
        functionId: FN_AI_REPORT,
        body: JSON.stringify({
          period_start: periodStart,
          period_end: periodEnd,
        }),
        path: '/generate',
        method: 'POST',
      });

      const response = JSON.parse(execution.responseBody);
      if (response.error) throw new Error(response.error);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { reports, total, loading, generating, error, fetchReports, generateReport };
}
```

- [ ] **Step 2: Create useSecurityConfig hook**

Create `src/hooks/useSecurityConfig.js`:
```javascript
import { useState, useCallback } from 'react';
import { databases } from '../lib/appwrite.js';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_SECURITY_ID;
const COL_CONFIG = import.meta.env.VITE_APPWRITE_COLLECTION_SECURITY_CONFIG;

export function useSecurityConfig() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_CONFIG,
        queries: [Query.limit(100)],
      });

      const configMap = {};
      for (const doc of result.documents) {
        configMap[doc.key] = { value: doc.value, $id: doc.$id };
      }
      setConfig(configMap);
      return configMap;
    } catch (err) {
      setError(err.message);
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (key, value) => {
    setError(null);
    try {
      const current = config[key];
      if (!current) {
        throw new Error(`Config key "${key}" not found. Create it in Appwrite first.`);
      }

      await databases.updateDocument({
        databaseId: DB_ID,
        collectionId: COL_CONFIG,
        documentId: current.$id,
        data: { value: String(value) },
      });

      setConfig((prev) => ({
        ...prev,
        [key]: { ...prev[key], value: String(value) },
      }));

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [config]);

  return { config, loading, error, fetchConfig, updateConfig };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAiReports.js src/hooks/useSecurityConfig.js
git commit -m "feat(copcivil): add useAiReports and useSecurityConfig hooks"
```

---

### Task 5: Sidebar Navigation — SecuritySidebarGroup

**Files:**
- Create: `src/components/admin/security/SecuritySidebarGroup.jsx`
- Modify: `src/components/admin/AdminSidebar.jsx`
- Modify: `src/components/admin/AdminLayout.jsx`

- [ ] **Step 1: Create SecuritySidebarGroup**

Create `src/components/admin/security/SecuritySidebarGroup.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  ChevronRight,
  BarChart3,
  FileWarning,
  ShieldBan,
  BrainCircuit,
  Settings,
} from 'lucide-react';

const SECURITY_ITEMS = [
  { path: '/admin/security', label: 'Ringkasan', icon: BarChart3 },
  { path: '/admin/security/incidents', label: 'Log Insiden', icon: FileWarning },
  { path: '/admin/security/blocklist', label: 'Daftar Blokir', icon: ShieldBan },
  { path: '/admin/security/ai-reports', label: 'Laporan AI', icon: BrainCircuit },
  { path: '/admin/security/config', label: 'Konfigurasi', icon: Settings },
];

export default function SecuritySidebarGroup({ onNavigate }) {
  const location = useLocation();
  const isSecurityRoute = location.pathname.startsWith('/admin/security');
  const [expanded, setExpanded] = useState(isSecurityRoute);

  useEffect(() => {
    if (isSecurityRoute) setExpanded(true);
  }, [isSecurityRoute]);

  const isActive = (path) => {
    if (path === '/admin/security') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="security-sidebar-group">
      <button
        className={`security-sidebar-toggle${isSecurityRoute ? ' active' : ''}`}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <Shield size={20} strokeWidth={2} />
        <span className="admin-sidebar-item-label">Keamanan</span>
        <ChevronRight
          size={16}
          strokeWidth={2}
          className={`security-sidebar-toggle-chevron${expanded ? ' expanded' : ''}`}
        />
      </button>

      <div className={`security-sidebar-subitems${expanded ? ' expanded' : ''}`}>
        {SECURITY_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`security-sidebar-subitem${isActive(item.path) ? ' active' : ''}`}
            aria-current={isActive(item.path) ? 'page' : undefined}
            onClick={onNavigate}
          >
            <item.icon size={16} strokeWidth={2} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Integrate SecuritySidebarGroup into AdminSidebar**

In `src/components/admin/AdminSidebar.jsx`, add the import at the top:
```javascript
import SecuritySidebarGroup from './security/SecuritySidebarGroup.jsx';
```

Then insert the SecuritySidebarGroup after the existing `<nav>` element and before the `<div className="admin-sidebar-footer">`:

Find this section in AdminSidebar.jsx:
```jsx
        </nav>

        <div className="admin-sidebar-footer">
```

Replace with:
```jsx
        </nav>

        <SecuritySidebarGroup onNavigate={onClose} />

        <div className="admin-sidebar-footer">
```

- [ ] **Step 3: Add security page titles to AdminLayout**

In `src/components/admin/AdminLayout.jsx`, update the `PAGE_TITLES` object:

Find:
```javascript
const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Manajemen User',
  '/admin/kontrak': 'Manajemen Kontrak',
  '/admin/inspeksi': 'Laporan Inspeksi',
  '/admin/notifikasi': 'Notifikasi',
};
```

Replace with:
```javascript
const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Manajemen User',
  '/admin/kontrak': 'Manajemen Kontrak',
  '/admin/inspeksi': 'Laporan Inspeksi',
  '/admin/notifikasi': 'Notifikasi',
  '/admin/security': 'Ringkasan Keamanan',
  '/admin/security/incidents': 'Log Insiden',
  '/admin/security/blocklist': 'Daftar Blokir IP',
  '/admin/security/ai-reports': 'Laporan AI',
  '/admin/security/config': 'Konfigurasi Keamanan',
};
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/security/SecuritySidebarGroup.jsx src/components/admin/AdminSidebar.jsx src/components/admin/AdminLayout.jsx
git commit -m "feat(copcivil): add expandable security sidebar navigation group"
```

---

### Task 6: Routing + Skeleton Pages

**Files:**
- Modify: `src/App.jsx`
- Create: `src/pages/admin/SecurityDashboardPage.jsx`
- Create: `src/pages/admin/IncidentLogPage.jsx`
- Create: `src/pages/admin/BlocklistPage.jsx`
- Create: `src/pages/admin/AiReportPage.jsx`
- Create: `src/pages/admin/SecurityConfigPage.jsx`

- [ ] **Step 1: Create skeleton pages**

Create `src/pages/admin/SecurityDashboardPage.jsx`:
```jsx
export default function SecurityDashboardPage() {
  return (
    <div>
      <h2>Ringkasan Keamanan</h2>
      <p className="security-empty">Halaman ini akan diimplementasi di Part 6.</p>
    </div>
  );
}
```

Create `src/pages/admin/IncidentLogPage.jsx`:
```jsx
export default function IncidentLogPage() {
  return (
    <div>
      <h2>Log Insiden</h2>
      <p className="security-empty">Halaman ini akan diimplementasi di Part 6.</p>
    </div>
  );
}
```

Create `src/pages/admin/BlocklistPage.jsx`:
```jsx
export default function BlocklistPage() {
  return (
    <div>
      <h2>Daftar Blokir IP</h2>
      <p className="security-empty">Halaman ini akan diimplementasi di Part 6.</p>
    </div>
  );
}
```

Create `src/pages/admin/AiReportPage.jsx`:
```jsx
export default function AiReportPage() {
  return (
    <div>
      <h2>Laporan AI</h2>
      <p className="security-empty">Halaman ini akan diimplementasi di Part 6.</p>
    </div>
  );
}
```

Create `src/pages/admin/SecurityConfigPage.jsx`:
```jsx
export default function SecurityConfigPage() {
  return (
    <div>
      <h2>Konfigurasi Keamanan</h2>
      <p className="security-empty">Halaman ini akan diimplementasi di Part 6.</p>
    </div>
  );
}
```

- [ ] **Step 2: Add routes to App.jsx**

In `src/App.jsx`, add the imports at the top (after existing admin page imports):
```javascript
import SecurityDashboardPage from './pages/admin/SecurityDashboardPage';
import IncidentLogPage from './pages/admin/IncidentLogPage';
import BlocklistPage from './pages/admin/BlocklistPage';
import AiReportPage from './pages/admin/AiReportPage';
import SecurityConfigPage from './pages/admin/SecurityConfigPage';
```

Then add the routes inside the existing `<Route path="/admin" ...>` element, after the `<Route path="notifikasi" .../>` line:

Find:
```jsx
          <Route path="notifikasi" element={<AdminNotifikasiPage />} />
        </Route>
```

Replace with:
```jsx
          <Route path="notifikasi" element={<AdminNotifikasiPage />} />
          <Route path="security" element={<SecurityDashboardPage />} />
          <Route path="security/incidents" element={<IncidentLogPage />} />
          <Route path="security/blocklist" element={<BlocklistPage />} />
          <Route path="security/ai-reports" element={<AiReportPage />} />
          <Route path="security/config" element={<SecurityConfigPage />} />
        </Route>
```

- [ ] **Step 3: Verify routing works**

Run:
```bash
npm run dev
```

Navigate to `http://localhost:5173/admin/security` (must be logged in as admin). Expected:
- Sidebar shows "Keamanan" expandable group
- Clicking sub-items navigates to skeleton pages
- Page titles update correctly in the top bar

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/SecurityDashboardPage.jsx src/pages/admin/IncidentLogPage.jsx src/pages/admin/BlocklistPage.jsx src/pages/admin/AiReportPage.jsx src/pages/admin/SecurityConfigPage.jsx src/App.jsx
git commit -m "feat(copcivil): add security routing + skeleton pages"
```

---

### Task 7: Verify Full Foundation

**Files:** None new — verification step.

- [ ] **Step 1: Run the full test suite to ensure nothing is broken**

Run:
```bash
npx vitest run
```

Expected: All 129 existing tests pass. No regressions.

- [ ] **Step 2: Verify dev server builds without errors**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(copcivil): complete Part 5 — frontend foundation ready"
```

---

## Summary

After completing all 7 tasks, you will have:

| Component | Files | Purpose |
|---|---|---|
| CSS foundation | `src/styles/security.css` | All security-specific styles |
| Shared badges | 3 badge + 1 stat card component | Reusable UI building blocks |
| Hooks | 4 hooks in `src/hooks/` | API access layer |
| Sidebar nav | `SecuritySidebarGroup` + modified sidebar | Expandable security menu |
| Routing | Modified `App.jsx` + 5 skeleton pages | Navigation structure |

**Total: 14 new files, 4 modified files, 7 commits.**

Next: Part 6 replaces skeleton pages with full implementations.
