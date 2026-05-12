# Copcivil Part 6: Frontend Pages — Security Dashboard, Incidents, Blocklist, AI Reports, Config

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 5 security admin pages with their page-specific components, replacing the skeleton pages from Part 5.

**Architecture:** Each page composes hooks (from Part 5) + shared components (badges, StatCard) + page-specific components (tables, filters, modals, charts, forms). Pages are standalone — each task produces a fully functional page.

**Tech Stack:** React 19, React Router 7, Appwrite SDK v24, Recharts, Lucide React, vanilla CSS.

**Spec Reference:** `docs/superpowers/specs/2026-04-29-copcivil-frontend-dashboard-design.md` — Section 6

**Depends On:** Part 5 (frontend foundation — hooks, shared components, routing, CSS)

---

## File Structure

```
src/
├── components/admin/security/
│   ├── CategoryPieChart.jsx      # Recharts pie chart (Task 1)
│   ├── IncidentFilters.jsx       # Filter bar (Task 2)
│   ├── IncidentTable.jsx         # Incident table with expand (Task 2)
│   ├── IncidentDetailRow.jsx     # Expandable row detail (Task 2)
│   ├── BlocklistTable.jsx        # IP blocklist table (Task 3)
│   ├── BlockIpModal.jsx          # Manual block modal (Task 3)
│   ├── AiReportCard.jsx          # Report list card (Task 4)
│   ├── AiReportDetail.jsx        # Full report view (Task 4)
│   └── SecurityConfigForm.jsx    # Config editor form (Task 5)
└── pages/admin/
    ├── SecurityDashboardPage.jsx # Replace skeleton (Task 1)
    ├── IncidentLogPage.jsx       # Replace skeleton (Task 2)
    ├── BlocklistPage.jsx         # Replace skeleton (Task 3)
    ├── AiReportPage.jsx          # Replace skeleton (Task 4)
    └── SecurityConfigPage.jsx    # Replace skeleton (Task 5)
```

---

### Task 1: Security Dashboard Page + Pie Chart

**Files:**
- Create: `src/components/admin/security/CategoryPieChart.jsx`
- Replace: `src/pages/admin/SecurityDashboardPage.jsx`

- [ ] **Step 1: Create CategoryPieChart**

Create `src/components/admin/security/CategoryPieChart.jsx`:
```jsx
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORY_COLORS = {
  sqli: '#3b82f6',
  xss: '#8b5cf6',
  cmdi: '#ef4444',
  path_traversal: '#f59e0b',
};

const CATEGORY_LABELS = {
  sqli: 'SQL Injection',
  xss: 'XSS',
  cmdi: 'Command Injection',
  path_traversal: 'Path Traversal',
};

export default function CategoryPieChart({ data }) {
  const chartData = Object.entries(data)
    .filter(([, count]) => count > 0)
    .map(([category, count]) => ({
      name: CATEGORY_LABELS[category] || category,
      value: count,
      color: CATEGORY_COLORS[category] || '#6b7280',
    }));

  if (chartData.length === 0) {
    return (
      <div className="security-chart-section">
        <h3 className="security-chart-title">Distribusi Kategori Serangan</h3>
        <p className="security-empty">Belum ada data insiden dalam 24 jam terakhir.</p>
      </div>
    );
  }

  return (
    <div className="security-chart-section">
      <h3 className="security-chart-title">Distribusi Kategori Serangan</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Implement SecurityDashboardPage**

Replace the contents of `src/pages/admin/SecurityDashboardPage.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useIncidents } from '../../hooks/useIncidents.js';
import { useBlocklist } from '../../hooks/useBlocklist.js';
import StatCard from '../../components/admin/security/StatCard.jsx';
import CategoryPieChart from '../../components/admin/security/CategoryPieChart.jsx';
import SeverityBadge from '../../components/admin/security/SeverityBadge.jsx';
import ActionBadge from '../../components/admin/security/ActionBadge.jsx';
import CategoryBadge from '../../components/admin/security/CategoryBadge.jsx';

export default function SecurityDashboardPage() {
  const { incidents, fetchIncidents, fetchStats, loading, error } = useIncidents();
  const { fetchActiveCount } = useBlocklist();

  const [stats, setStats] = useState({ total24h: 0, blocked24h: 0, categoryBreakdown: {} });
  const [activeBlocked, setActiveBlocked] = useState(0);

  useEffect(() => {
    fetchStats().then(setStats);
    fetchActiveCount().then(setActiveBlocked);
    fetchIncidents({ page: 1, limit: 5 });
  }, [fetchStats, fetchActiveCount, fetchIncidents]);

  if (error) {
    return <div className="security-error">Gagal memuat data: {error}</div>;
  }

  return (
    <div>
      <div className="security-stats-row">
        <StatCard
          label="Total Insiden (24 Jam)"
          value={stats.total24h}
          color="var(--severity-high)"
        />
        <StatCard
          label="Serangan Diblokir (24 Jam)"
          value={stats.blocked24h}
          color="var(--severity-critical)"
        />
        <StatCard
          label="IP Diblokir Aktif"
          value={activeBlocked}
          color="var(--severity-medium)"
        />
      </div>

      <CategoryPieChart data={stats.categoryBreakdown} />

      <div className="security-table-wrapper">
        <div className="security-page-header" style={{ padding: '1rem 1rem 0' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Insiden Terbaru</h3>
          <Link to="/admin/security/incidents" className="security-btn security-btn--ghost">
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="security-loading">Memuat...</div>
        ) : incidents.length === 0 ? (
          <p className="security-empty">Belum ada insiden tercatat.</p>
        ) : (
          <table className="security-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>IP</th>
                <th>Kategori</th>
                <th>Tingkat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.$id}>
                  <td>{new Date(inc.timestamp).toLocaleString('id-ID')}</td>
                  <td><code>{inc.ip_address}</code></td>
                  <td><CategoryBadge category={inc.attack_category} /></td>
                  <td><SeverityBadge severity={inc.severity} /></td>
                  <td><ActionBadge action={inc.action_taken} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify dashboard page renders**

Run:
```bash
npm run dev
```

Navigate to `/admin/security`. Expected: stat cards (may show 0), pie chart (empty state or chart), recent incidents table.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/security/CategoryPieChart.jsx src/pages/admin/SecurityDashboardPage.jsx
git commit -m "feat(copcivil): implement security dashboard page with stats and pie chart"
```

---

### Task 2: Incident Log Page + Filters + Table

**Files:**
- Create: `src/components/admin/security/IncidentFilters.jsx`
- Create: `src/components/admin/security/IncidentDetailRow.jsx`
- Create: `src/components/admin/security/IncidentTable.jsx`
- Replace: `src/pages/admin/IncidentLogPage.jsx`

- [ ] **Step 1: Create IncidentFilters**

Create `src/components/admin/security/IncidentFilters.jsx`:
```jsx
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function IncidentFilters({ onApply }) {
  const [ip, setIp] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [action, setAction] = useState('');

  const handleApply = () => {
    onApply({ ip, category, severity, action });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <div className="security-filters">
      <div className="security-filter-group">
        <label htmlFor="filter-ip">IP Address</label>
        <input
          id="filter-ip"
          type="text"
          placeholder="Cari IP..."
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="security-filter-group">
        <label htmlFor="filter-category">Kategori</label>
        <select id="filter-category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Semua</option>
          <option value="sqli">SQL Injection</option>
          <option value="xss">XSS</option>
          <option value="cmdi">Command Injection</option>
          <option value="path_traversal">Path Traversal</option>
        </select>
      </div>

      <div className="security-filter-group">
        <label htmlFor="filter-severity">Tingkat</label>
        <select id="filter-severity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">Semua</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="security-filter-group">
        <label htmlFor="filter-action">Aksi</label>
        <select id="filter-action" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">Semua</option>
          <option value="blocked">Diblokir</option>
          <option value="warned">Diperingatkan</option>
          <option value="logged">Dicatat</option>
        </select>
      </div>

      <div className="security-filter-group">
        <label>&nbsp;</label>
        <button className="security-btn security-btn--primary" onClick={handleApply}>
          <Search size={16} /> Terapkan
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create IncidentDetailRow**

Create `src/components/admin/security/IncidentDetailRow.jsx`:
```jsx
export default function IncidentDetailRow({ incident }) {
  let patterns = [];
  try {
    patterns = JSON.parse(incident.matched_patterns || '[]');
  } catch {
    patterns = [];
  }

  return (
    <tr className="security-detail-row">
      <td colSpan="7">
        <div className="security-detail-content">
          <div className="security-detail-item">
            <label>URL Lengkap</label>
            <span>{incident.request_url || '—'}</span>
          </div>
          <div className="security-detail-item">
            <label>User Agent</label>
            <span>{incident.user_agent || '—'}</span>
          </div>
          <div className="security-detail-item">
            <label>Pola Terdeteksi</label>
            <span>{Array.isArray(patterns) ? patterns.join(', ') : String(patterns)}</span>
          </div>
          <div className="security-detail-item">
            <label>Cuplikan Body</label>
            <span>{incident.request_body_snippet || '—'}</span>
          </div>
        </div>
      </td>
    </tr>
  );
}
```

- [ ] **Step 3: Create IncidentTable**

Create `src/components/admin/security/IncidentTable.jsx`:
```jsx
import { useState } from 'react';
import SeverityBadge from './SeverityBadge.jsx';
import ActionBadge from './ActionBadge.jsx';
import CategoryBadge from './CategoryBadge.jsx';
import IncidentDetailRow from './IncidentDetailRow.jsx';

export default function IncidentTable({ incidents }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (incidents.length === 0) {
    return <p className="security-empty">Tidak ada insiden ditemukan.</p>;
  }

  return (
    <div className="security-table-wrapper">
      <table className="security-table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>IP</th>
            <th>Kategori</th>
            <th>Tingkat</th>
            <th>Skor</th>
            <th>Aksi</th>
            <th>Layer</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <>
              <tr
                key={inc.$id}
                className="clickable"
                onClick={() => toggleExpand(inc.$id)}
                aria-expanded={expandedId === inc.$id}
              >
                <td>{new Date(inc.timestamp).toLocaleString('id-ID')}</td>
                <td><code>{inc.ip_address}</code></td>
                <td><CategoryBadge category={inc.attack_category} /></td>
                <td><SeverityBadge severity={inc.severity} /></td>
                <td>{inc.threat_score}</td>
                <td><ActionBadge action={inc.action_taken} /></td>
                <td>{inc.layer}</td>
              </tr>
              {expandedId === inc.$id && (
                <IncidentDetailRow key={`${inc.$id}-detail`} incident={inc} />
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Implement IncidentLogPage**

Replace the contents of `src/pages/admin/IncidentLogPage.jsx`:
```jsx
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIncidents } from '../../hooks/useIncidents.js';
import IncidentFilters from '../../components/admin/security/IncidentFilters.jsx';
import IncidentTable from '../../components/admin/security/IncidentTable.jsx';

const PAGE_SIZE = 25;

export default function IncidentLogPage() {
  const { incidents, total, loading, error, fetchIncidents } = useIncidents();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const loadData = useCallback(() => {
    fetchIncidents({ page, limit: PAGE_SIZE, ...filters });
  }, [page, filters, fetchIncidents]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleApply = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div>
      <IncidentFilters onApply={handleApply} />

      {error && <div className="security-error">Gagal memuat data: {error}</div>}

      {loading ? (
        <div className="security-loading">Memuat insiden...</div>
      ) : (
        <IncidentTable incidents={incidents} />
      )}

      {totalPages > 1 && (
        <div className="security-pagination">
          <span>
            Halaman {page} dari {totalPages} ({total} insiden)
          </span>
          <div className="security-pagination-buttons">
            <button
              className="security-btn security-btn--secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <button
              className="security-btn security-btn--secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Selanjutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify incident log page**

Run dev server, navigate to `/admin/security/incidents`. Expected: filter bar, table (empty or populated), pagination.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/security/IncidentFilters.jsx src/components/admin/security/IncidentDetailRow.jsx src/components/admin/security/IncidentTable.jsx src/pages/admin/IncidentLogPage.jsx
git commit -m "feat(copcivil): implement incident log page with filters and expandable rows"
```

---

### Task 3: Blocklist Page + Table + Modal

**Files:**
- Create: `src/components/admin/security/BlocklistTable.jsx`
- Create: `src/components/admin/security/BlockIpModal.jsx`
- Replace: `src/pages/admin/BlocklistPage.jsx`

- [ ] **Step 1: Create BlocklistTable**

Create `src/components/admin/security/BlocklistTable.jsx`:
```jsx
export default function BlocklistTable({ blocklist, onUnblock }) {
  if (blocklist.length === 0) {
    return <p className="security-empty">Tidak ada IP yang diblokir.</p>;
  }

  return (
    <div className="security-table-wrapper">
      <table className="security-table">
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Alasan</th>
            <th>Tipe</th>
            <th>Diblokir Pada</th>
            <th>Kadaluarsa</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {blocklist.map((item) => (
            <tr key={item.$id}>
              <td><code>{item.ip_address}</code></td>
              <td>{item.reason}</td>
              <td>
                <span className={`security-badge security-badge--${item.block_type === 'auto' ? 'warned' : 'blocked'}`}>
                  {item.block_type === 'auto' ? 'Otomatis' : 'Manual'}
                </span>
              </td>
              <td>{new Date(item.blocked_at).toLocaleString('id-ID')}</td>
              <td>{item.expires_at ? new Date(item.expires_at).toLocaleString('id-ID') : 'Permanen'}</td>
              <td>
                <span className={`security-badge security-badge--${item.status === 'active' ? 'blocked' : 'logged'}`}>
                  {item.status === 'active' ? 'Aktif' : item.status === 'expired' ? 'Kadaluarsa' : 'Whitelist'}
                </span>
              </td>
              <td>
                {item.status === 'active' && (
                  <button
                    className="security-btn security-btn--ghost"
                    onClick={() => onUnblock(item.ip_address)}
                  >
                    Buka Blokir
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create BlockIpModal**

Create `src/components/admin/security/BlockIpModal.jsx`:
```jsx
import { useState } from 'react';

export default function BlockIpModal({ open, onClose, onSubmit }) {
  const [ipAddress, setIpAddress] = useState('');
  const [reason, setReason] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ip_address: ipAddress.trim(),
        reason: reason.trim(),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      setIpAddress('');
      setReason('');
      setExpiresAt('');
      onClose();
    } catch {
      // error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="security-modal-overlay" onClick={onClose}>
      <div className="security-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="security-modal-title">Blokir IP Address</h3>
        <form onSubmit={handleSubmit}>
          <div className="security-form-group">
            <label htmlFor="block-ip">IP Address *</label>
            <input
              id="block-ip"
              type="text"
              placeholder="Contoh: 192.168.1.100"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              required
            />
          </div>

          <div className="security-form-group">
            <label htmlFor="block-reason">Alasan *</label>
            <textarea
              id="block-reason"
              placeholder="Alasan pemblokiran..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="security-form-group">
            <label htmlFor="block-expires">Kadaluarsa (opsional)</label>
            <input
              id="block-expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <span className="security-form-helper">
              Kosongkan untuk blokir permanen.
            </span>
          </div>

          <div className="security-modal-actions">
            <button
              type="button"
              className="security-btn security-btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="security-btn security-btn--danger"
              disabled={submitting}
            >
              {submitting ? 'Memblokir...' : 'Blokir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement BlocklistPage**

Replace the contents of `src/pages/admin/BlocklistPage.jsx`:
```jsx
import { useState, useEffect, useCallback } from 'react';
import { ShieldBan, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBlocklist } from '../../hooks/useBlocklist.js';
import BlocklistTable from '../../components/admin/security/BlocklistTable.jsx';
import BlockIpModal from '../../components/admin/security/BlockIpModal.jsx';

const PAGE_SIZE = 25;

export default function BlocklistPage() {
  const { blocklist, total, loading, error, fetchBlocklist, blockIp, unblockIp, cleanupExpired } =
    useBlocklist();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('active');
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(() => {
    fetchBlocklist({ page, limit: PAGE_SIZE, status });
  }, [page, status, fetchBlocklist]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleBlock = async (data) => {
    await blockIp(data);
    loadData();
  };

  const handleUnblock = async (ipAddress) => {
    if (!confirm(`Buka blokir untuk ${ipAddress}?`)) return;
    await unblockIp({ ip_address: ipAddress });
    loadData();
  };

  const handleCleanup = async () => {
    const result = await cleanupExpired();
    if (result) {
      alert(`${result.cleaned} blokir kadaluarsa telah dibersihkan.`);
      loadData();
    }
  };

  return (
    <div>
      <div className="security-page-header">
        <div className="security-page-header-actions">
          <button className="security-btn security-btn--danger" onClick={() => setModalOpen(true)}>
            <ShieldBan size={16} /> Blokir IP
          </button>
          <button className="security-btn security-btn--secondary" onClick={handleCleanup}>
            <Trash2 size={16} /> Bersihkan Kadaluarsa
          </button>
        </div>

        <div className="security-filter-group">
          <label htmlFor="blocklist-status">Status</label>
          <select
            id="blocklist-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="active">Aktif</option>
            <option value="expired">Kadaluarsa</option>
            <option value="semua">Semua</option>
          </select>
        </div>
      </div>

      {error && <div className="security-error">Gagal memuat data: {error}</div>}

      {loading ? (
        <div className="security-loading">Memuat daftar blokir...</div>
      ) : (
        <BlocklistTable blocklist={blocklist} onUnblock={handleUnblock} />
      )}

      {totalPages > 1 && (
        <div className="security-pagination">
          <span>
            Halaman {page} dari {totalPages} ({total} IP)
          </span>
          <div className="security-pagination-buttons">
            <button
              className="security-btn security-btn--secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <button
              className="security-btn security-btn--secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Selanjutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <BlockIpModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleBlock} />
    </div>
  );
}
```

- [ ] **Step 4: Verify blocklist page**

Run dev server, navigate to `/admin/security/blocklist`. Expected: header with buttons, table, status filter, block IP modal opens on click.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/security/BlocklistTable.jsx src/components/admin/security/BlockIpModal.jsx src/pages/admin/BlocklistPage.jsx
git commit -m "feat(copcivil): implement blocklist page with table and block IP modal"
```

---

### Task 4: AI Report Page + Report Card + Detail View

**Files:**
- Create: `src/components/admin/security/AiReportCard.jsx`
- Create: `src/components/admin/security/AiReportDetail.jsx`
- Replace: `src/pages/admin/AiReportPage.jsx`

- [ ] **Step 1: Create AiReportCard**

Create `src/components/admin/security/AiReportCard.jsx`:
```jsx
export default function AiReportCard({ report, onClick }) {
  return (
    <div className="security-report-card" onClick={() => onClick(report)} role="button" tabIndex={0}>
      <div className="security-report-card-header">
        <span className="security-report-card-date">
          {new Date(report.generated_at).toLocaleString('id-ID')}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className={`security-badge security-badge--${report.report_type === 'periodic' ? 'logged' : 'warned'}`}>
            {report.report_type === 'periodic' ? 'Periodik' : 'On-Demand'}
          </span>
          <span className="security-badge security-badge--low">{report.model_used}</span>
        </div>
      </div>
      <p className="security-report-card-summary">{report.summary}</p>
    </div>
  );
}
```

- [ ] **Step 2: Create AiReportDetail**

Create `src/components/admin/security/AiReportDetail.jsx`:
```jsx
import { ArrowLeft } from 'lucide-react';

export default function AiReportDetail({ report, onBack }) {
  let stats = {};
  try {
    stats = JSON.parse(report.stats_json || '{}');
  } catch {
    stats = {};
  }

  return (
    <div>
      <button className="security-btn security-btn--ghost" onClick={onBack} style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Kembali
      </button>

      <div className="security-chart-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 className="security-chart-title" style={{ margin: 0 }}>Laporan AI</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className={`security-badge security-badge--${report.report_type === 'periodic' ? 'logged' : 'warned'}`}>
              {report.report_type === 'periodic' ? 'Periodik' : 'On-Demand'}
            </span>
            <span className="security-badge security-badge--low">{report.model_used}</span>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Periode: {new Date(report.period_start).toLocaleDateString('id-ID')} – {new Date(report.period_end).toLocaleDateString('id-ID')}
          &nbsp;|&nbsp;Dibuat: {new Date(report.generated_at).toLocaleString('id-ID')}
        </div>

        <div className="security-form-section">
          <h4 className="security-form-section-title">Ringkasan</h4>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>{report.summary}</p>
        </div>

        {report.recommendations && (
          <div className="security-form-section">
            <h4 className="security-form-section-title">Rekomendasi</h4>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>{report.recommendations}</p>
          </div>
        )}

        {Object.keys(stats).length > 0 && (
          <div className="security-form-section">
            <h4 className="security-form-section-title">Statistik</h4>
            <div className="security-table-wrapper">
              <table className="security-table">
                <thead>
                  <tr>
                    <th>Metrik</th>
                    <th>Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement AiReportPage**

Replace the contents of `src/pages/admin/AiReportPage.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { BrainCircuit, Loader } from 'lucide-react';
import { useAiReports } from '../../hooks/useAiReports.js';
import AiReportCard from '../../components/admin/security/AiReportCard.jsx';
import AiReportDetail from '../../components/admin/security/AiReportDetail.jsx';

export default function AiReportPage() {
  const { reports, loading, generating, error, fetchReports, generateReport } = useAiReports();
  const [selectedReport, setSelectedReport] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerate = async () => {
    if (!periodStart || !periodEnd) {
      alert('Pilih periode awal dan akhir.');
      return;
    }

    try {
      await generateReport({
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString(),
      });
      setShowGenerate(false);
      setPeriodStart('');
      setPeriodEnd('');
      fetchReports();
    } catch {
      // error handled by hook
    }
  };

  if (selectedReport) {
    return (
      <AiReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} />
    );
  }

  return (
    <div>
      <div className="security-page-header">
        <div className="security-page-header-actions">
          {showGenerate ? (
            <div className="security-filters" style={{ margin: 0 }}>
              <div className="security-filter-group">
                <label htmlFor="gen-start">Periode Awal</label>
                <input
                  id="gen-start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className="security-filter-group">
                <label htmlFor="gen-end">Periode Akhir</label>
                <input
                  id="gen-end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
              <div className="security-filter-group">
                <label>&nbsp;</label>
                <button
                  className="security-btn security-btn--primary"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <><Loader size={16} className="spin" /> Membuat laporan...</>
                  ) : (
                    'Buat'
                  )}
                </button>
              </div>
              <div className="security-filter-group">
                <label>&nbsp;</label>
                <button
                  className="security-btn security-btn--secondary"
                  onClick={() => setShowGenerate(false)}
                  disabled={generating}
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              className="security-btn security-btn--primary"
              onClick={() => setShowGenerate(true)}
            >
              <BrainCircuit size={16} /> Buat Laporan
            </button>
          )}
        </div>
      </div>

      {error && <div className="security-error">Gagal: {error}</div>}

      {loading ? (
        <div className="security-loading">Memuat laporan...</div>
      ) : reports.length === 0 ? (
        <p className="security-empty">Belum ada laporan AI. Buat laporan pertama Anda.</p>
      ) : (
        reports.map((report) => (
          <AiReportCard
            key={report.$id}
            report={report}
            onClick={setSelectedReport}
          />
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify AI report page**

Run dev server, navigate to `/admin/security/ai-reports`. Expected: "Buat Laporan" button, report cards (or empty state), clicking card shows detail view.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/security/AiReportCard.jsx src/components/admin/security/AiReportDetail.jsx src/pages/admin/AiReportPage.jsx
git commit -m "feat(copcivil): implement AI report page with card list and detail view"
```

---

### Task 5: Security Config Page + Form

**Files:**
- Create: `src/components/admin/security/SecurityConfigForm.jsx`
- Replace: `src/pages/admin/SecurityConfigPage.jsx`

- [ ] **Step 1: Create SecurityConfigForm**

Create `src/components/admin/security/SecurityConfigForm.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

const CONFIG_FIELDS = [
  {
    section: 'Ambang Batas Deteksi',
    fields: [
      { key: 'block_threshold', label: 'Ambang blokir', type: 'number', default: '15', helper: 'Skor >= nilai ini akan diblokir' },
      { key: 'warn_threshold', label: 'Ambang peringatan', type: 'number', default: '7', helper: 'Skor >= nilai ini akan diperingatkan' },
    ],
  },
  {
    section: 'Auto-Blokir',
    fields: [
      { key: 'auto_block_incident_count', label: 'Jumlah insiden untuk auto-blokir', type: 'number', default: '5' },
      { key: 'auto_block_window_minutes', label: 'Jendela waktu (menit)', type: 'number', default: '10' },
      { key: 'auto_block_duration_hours', label: 'Durasi blokir (jam)', type: 'number', default: '24' },
    ],
  },
  {
    section: 'AI Analytics',
    fields: [
      { key: 'openrouter_model', label: 'Model OpenRouter', type: 'text', default: 'anthropic/claude-sonnet-4', helper: 'Nama model dari OpenRouter (contoh: anthropic/claude-sonnet-4)' },
    ],
  },
  {
    section: 'IP Whitelist',
    fields: [
      { key: 'admin_whitelist_ips', label: 'Daftar IP Whitelist', type: 'textarea', default: '[]', helper: 'IP dalam daftar ini tidak akan diblokir secara otomatis. Format: JSON array, contoh: ["1.2.3.4", "5.6.7.8"]' },
    ],
  },
];

export default function SecurityConfigForm({ config, onSave, saving }) {
  const [values, setValues] = useState({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const initial = {};
    for (const section of CONFIG_FIELDS) {
      for (const field of section.fields) {
        initial[field.key] = config[field.key]?.value ?? field.default;
      }
    }
    setValues(initial);
    setDirty(false);
  }, [config]);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(values);
    setDirty(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {CONFIG_FIELDS.map((section) => (
        <div key={section.section} className="security-form-section">
          <h3 className="security-form-section-title">{section.section}</h3>
          {section.fields.map((field) => (
            <div key={field.key} className="security-form-group">
              <label htmlFor={`config-${field.key}`}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={`config-${field.key}`}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={4}
                />
              ) : (
                <input
                  id={`config-${field.key}`}
                  type={field.type}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}
              {field.helper && <span className="security-form-helper">{field.helper}</span>}
            </div>
          ))}
        </div>
      ))}

      <button
        type="submit"
        className="security-btn security-btn--primary"
        disabled={!dirty || saving}
      >
        <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Implement SecurityConfigPage**

Replace the contents of `src/pages/admin/SecurityConfigPage.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { useSecurityConfig } from '../../hooks/useSecurityConfig.js';
import SecurityConfigForm from '../../components/admin/security/SecurityConfigForm.jsx';

export default function SecurityConfigPage() {
  const { config, loading, error, fetchConfig, updateConfig } = useSecurityConfig();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const changedKeys = Object.keys(values).filter(
        (key) => config[key]?.value !== values[key]
      );

      for (const key of changedKeys) {
        await updateConfig(key, values[key]);
      }

      alert('Konfigurasi berhasil disimpan.');
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="security-loading">Memuat konfigurasi...</div>;
  }

  if (error) {
    return <div className="security-error">Gagal memuat konfigurasi: {error}</div>;
  }

  return (
    <div>
      <SecurityConfigForm config={config} onSave={handleSave} saving={saving} />
    </div>
  );
}
```

- [ ] **Step 3: Verify config page**

Run dev server, navigate to `/admin/security/config`. Expected: form sections with fields, save button disabled until changes made.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/security/SecurityConfigForm.jsx src/pages/admin/SecurityConfigPage.jsx
git commit -m "feat(copcivil): implement security config page with form editor"
```

---

### Task 6: Verify Full Frontend + Build

**Files:** None new — verification step.

- [ ] **Step 1: Run the full test suite**

Run:
```bash
npx vitest run
```

Expected: All 129 backend tests still pass. No regressions.

- [ ] **Step 2: Build for production**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(copcivil): complete Part 6 — all 5 security pages implemented"
```

---

## Summary

After completing all 6 tasks, you will have:

| Page | Components | Route |
|---|---|---|
| Ringkasan Keamanan | StatCard, CategoryPieChart, badges | `/admin/security` |
| Log Insiden | IncidentFilters, IncidentTable, IncidentDetailRow | `/admin/security/incidents` |
| Daftar Blokir IP | BlocklistTable, BlockIpModal | `/admin/security/blocklist` |
| Laporan AI | AiReportCard, AiReportDetail | `/admin/security/ai-reports` |
| Konfigurasi | SecurityConfigForm | `/admin/security/config` |

**Total: 14 new files (9 components + 5 pages), 6 commits.**

Frontend implementation complete. All 5 security admin pages are functional.
