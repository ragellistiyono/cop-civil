# Phase A: Halaman Kontrak Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build public `/kontrak` and `/kontrak/:id` pages to display and preview PDF contract documents, with an abstracted data layer ready for future Appwrite migration.

**Architecture:** Static data config → custom hook abstraction (`useKontrak`) → page/component consumers. PDF files served from `public/docs/kontrak/`. All new components follow the existing Industrial Skeuomorphism design system with neumorphic shadows, PLN Blue/Yellow accents, and "bolted module" card patterns.

**Tech Stack:** React 19, react-router-dom 7, lucide-react icons, CSS custom properties (design tokens), no additional dependencies needed.

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `src/data/kontrak.js` | Static config array of kontrak objects with metadata + dokumen lists |
| `src/hooks/useKontrak.js` | Custom hook abstracting data access; returns `{ kontrakList, getKontrakById, loading, error }` |
| `src/components/KontrakCard.jsx` | Card component for kontrak list — uses existing `.card` pattern |
| `src/components/DokumenItem.jsx` | Row component for a single document — icon + name + badge + action buttons |
| `src/components/PdfViewer.jsx` | Embedded PDF preview using `<iframe>` with mobile fallback |
| `src/pages/KontrakPage.jsx` | List page at `/kontrak` — section header + card grid |
| `src/pages/KontrakDetailPage.jsx` | Detail page at `/kontrak/:id` — breadcrumb + info + documents + PDF viewer |

### Modified Files

| File | Change |
|---|---|
| `src/App.jsx` | Add imports and routes for `KontrakPage` and `KontrakDetailPage` |
| `src/components/BottomNav.jsx` | Replace `/pekerjaan-beton` nav item with `/kontrak` |
| `src/styles/components.css` | Add CSS classes for kontrak-specific components |
| `src/styles/layouts.css` | Add kontrak grid layout + responsive rules |

---

### Task 1: Static Data Config

**Files:**
- Create: `src/data/kontrak.js`

- [ ] **Step 1: Create the kontrak data file**

Create `src/data/kontrak.js` with the two existing contracts mapped from the `public/docs/kontrak/` folder:

```javascript
export const KONTRAK_DATA = [
  {
    id: '002-pj-2025',
    nomorKontrak: '002.PJ.2025',
    namaProyek: 'Pekerjaan Sipil 002.PJ.2025',
    tanggal: '2025-01-01',
    status: 'aktif',
    dokumen: [
      {
        id: 'ad-002',
        tipe: 'approval-drawing',
        nama: 'Approval Drawing 002.PJ.2025',
        path: '/docs/kontrak/Kontrak 002.PJ.2025/Approval Drawing 002.PJ.2025.pdf',
        sumber: 'lokal',
        ukuran: null,
      },
      {
        id: 'boq-002',
        tipe: 'boq',
        nama: 'BOQ 002.PJ.2025',
        path: '/docs/kontrak/Kontrak 002.PJ.2025/BOQ 002.PJ.2025.pdf',
        sumber: 'lokal',
        ukuran: null,
      },
    ],
  },
  {
    id: '005-pj-2025',
    nomorKontrak: '005.PJ.2025',
    namaProyek: 'Pekerjaan Sipil 005.PJ.2025',
    tanggal: '2025-01-01',
    status: 'aktif',
    dokumen: [
      {
        id: 'ad-005',
        tipe: 'approval-drawing',
        nama: 'Approval Drawing 005.PJ.2025',
        path: '/docs/kontrak/Kontrak 005.PJ.2025/Approval Drawing 005.PJ.2025.pdf',
        sumber: 'lokal',
        ukuran: null,
      },
      {
        id: 'boq-005',
        tipe: 'boq',
        nama: 'BOQ 005.PJ.2025',
        path: '/docs/kontrak/Kontrak 005.PJ.2025/BOQ 005.2025.pdf',
        sumber: 'lokal',
        ukuran: null,
      },
    ],
  },
];
```

- [ ] **Step 2: Verify file is valid**

Run: `node -e "import('./src/data/kontrak.js').then(m => console.log(m.KONTRAK_DATA.length, 'kontrak loaded'))"`

Expected: `2 kontrak loaded`

- [ ] **Step 3: Commit**

```bash
git add src/data/kontrak.js
git commit -m "feat: add static kontrak data config"
```

---

### Task 2: useKontrak Hook

**Files:**
- Create: `src/hooks/useKontrak.js`

- [ ] **Step 1: Create the custom hook**

Create `src/hooks/useKontrak.js`:

```javascript
import { useMemo } from 'react';
import { KONTRAK_DATA } from '../data/kontrak';

export function useKontrakList() {
  const kontrakList = useMemo(() => KONTRAK_DATA, []);
  return { kontrakList, loading: false, error: null };
}

export function useKontrakById(id) {
  const kontrak = useMemo(
    () => KONTRAK_DATA.find((k) => k.id === id) ?? null,
    [id]
  );
  return { kontrak, loading: false, error: null };
}
```

This hook currently reads from static data. When migrating to Appwrite in Phase C, only this file needs to change — replace `KONTRAK_DATA` reads with Appwrite SDK calls, set `loading: true` during fetch, and populate `error` on failure.

- [ ] **Step 2: Verify hook module is valid**

Run: `node -e "import('./src/hooks/useKontrak.js').then(m => console.log('exports:', Object.keys(m)))"`

Expected: `exports: [ 'useKontrakList', 'useKontrakById' ]`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useKontrak.js
git commit -m "feat: add useKontrak hook for data layer abstraction"
```

---

### Task 3: KontrakCard Component

**Files:**
- Create: `src/components/KontrakCard.jsx`

- [ ] **Step 1: Create the KontrakCard component**

Create `src/components/KontrakCard.jsx`:

```jsx
import { Link } from 'react-router-dom';
import { FileText, Calendar, FolderOpen } from 'lucide-react';

const STATUS_LABELS = {
  aktif: 'Aktif',
  selesai: 'Selesai',
  'dalam-proses': 'Dalam Proses',
};

export default function KontrakCard({ kontrak }) {
  return (
    <Link to={`/kontrak/${kontrak.id}`} className="kontrak-card card">
      <div className="kontrak-card-header">
        <div className="card-icon kontrak-card-icon">
          <FolderOpen size={24} strokeWidth={2} />
        </div>
        <span className={`badge kontrak-status kontrak-status--${kontrak.status}`}>
          {STATUS_LABELS[kontrak.status] || kontrak.status}
        </span>
      </div>

      <h3 className="card-title">Kontrak {kontrak.nomorKontrak}</h3>
      <p className="card-text">{kontrak.namaProyek}</p>

      <div className="kontrak-card-meta">
        <span className="kontrak-meta-item">
          <Calendar size={14} strokeWidth={2} />
          {new Date(kontrak.tanggal).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <span className="kontrak-meta-item">
          <FileText size={14} strokeWidth={2} />
          {kontrak.dokumen.length} Dokumen
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/KontrakCard.jsx
git commit -m "feat: add KontrakCard component"
```

---

### Task 4: DokumenItem Component

**Files:**
- Create: `src/components/DokumenItem.jsx`

- [ ] **Step 1: Create the DokumenItem component**

Create `src/components/DokumenItem.jsx`:

```jsx
import { FileImage, FileSpreadsheet, FileText, Eye, Download } from 'lucide-react';

const TIPE_CONFIG = {
  'approval-drawing': { label: 'Approval Drawing', Icon: FileImage },
  boq: { label: 'BOQ', Icon: FileSpreadsheet },
  spesifikasi: { label: 'Spesifikasi', Icon: FileText },
  lainnya: { label: 'Dokumen', Icon: FileText },
};

export default function DokumenItem({ dokumen, onPreview, isActive }) {
  const config = TIPE_CONFIG[dokumen.tipe] || TIPE_CONFIG.lainnya;
  const { Icon, label } = config;

  return (
    <div className={`dokumen-item${isActive ? ' dokumen-item--active' : ''}`}>
      <div className="dokumen-item-icon">
        <Icon size={20} strokeWidth={2} />
      </div>

      <div className="dokumen-item-info">
        <span className="dokumen-item-name">{dokumen.nama}</span>
        <span className="badge dokumen-item-badge">{label}</span>
      </div>

      <div className="dokumen-item-actions">
        <button
          className="btn btn-secondary dokumen-btn"
          onClick={() => onPreview(dokumen)}
          aria-label={`Preview ${dokumen.nama}`}
        >
          <Eye size={16} strokeWidth={2.5} />
          <span className="dokumen-btn-label">Preview</span>
        </button>
        <a
          href={dokumen.path}
          download
          className="btn btn-primary dokumen-btn"
          aria-label={`Download ${dokumen.nama}`}
        >
          <Download size={16} strokeWidth={2.5} />
          <span className="dokumen-btn-label">Download</span>
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DokumenItem.jsx
git commit -m "feat: add DokumenItem component"
```

---

### Task 5: PdfViewer Component

**Files:**
- Create: `src/components/PdfViewer.jsx`

- [ ] **Step 1: Create the PdfViewer component**

Create `src/components/PdfViewer.jsx`:

```jsx
import { X, Maximize2, ExternalLink, Download } from 'lucide-react';

function useIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

export default function PdfViewer({ dokumen, onClose }) {
  const isMobile = useIsMobile();

  if (!dokumen) return null;

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer-header">
        <span className="pdf-viewer-title">{dokumen.nama}</span>
        <div className="pdf-viewer-controls">
          <a
            href={dokumen.path}
            target="_blank"
            rel="noopener noreferrer"
            className="pdf-viewer-btn"
            aria-label="Buka di tab baru"
          >
            <Maximize2 size={16} strokeWidth={2.5} />
          </a>
          <button
            className="pdf-viewer-btn"
            onClick={onClose}
            aria-label="Tutup preview"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {isMobile ? (
        <div className="pdf-viewer-mobile-fallback">
          <p>Preview PDF tidak tersedia pada perangkat mobile.</p>
          <div className="pdf-viewer-mobile-actions">
            <a
              href={dokumen.path}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <ExternalLink size={18} strokeWidth={2.5} />
              Buka PDF
            </a>
            <a href={dokumen.path} download className="btn btn-secondary">
              <Download size={18} strokeWidth={2.5} />
              Download
            </a>
          </div>
        </div>
      ) : (
        <iframe
          src={dokumen.path}
          className="pdf-viewer-iframe"
          title={`Preview: ${dokumen.nama}`}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PdfViewer.jsx
git commit -m "feat: add PdfViewer component with mobile fallback"
```

---

### Task 6: KontrakPage (List View)

**Files:**
- Create: `src/pages/KontrakPage.jsx`

- [ ] **Step 1: Create the KontrakPage**

Create `src/pages/KontrakPage.jsx`:

```jsx
import { FolderOpen } from 'lucide-react';
import { useKontrakList } from '../hooks/useKontrak';
import KontrakCard from '../components/KontrakCard';
import Footer from '../components/Footer';

export default function KontrakPage() {
  const { kontrakList, loading, error } = useKontrakList();

  return (
    <>
      <section className="section kontrak-section" aria-labelledby="kontrak-heading">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Dokumentasi Resmi</p>
            <h1 className="section-title" id="kontrak-heading">
              Dokumentasi Kontrak
            </h1>
            <p className="section-description">
              Akses dokumen resmi kontrak pekerjaan sipil PT PLN (Persero) UPT
              Malang. Tersedia dokumen Approval Drawing, Bill of Quantity (BOQ),
              dan dokumen pendukung lainnya untuk setiap paket pekerjaan.
            </p>
          </div>

          {loading && <p className="kontrak-loading">Memuat data kontrak…</p>}

          {error && (
            <p className="kontrak-error">Gagal memuat data: {error.message}</p>
          )}

          {!loading && !error && kontrakList.length === 0 && (
            <div className="kontrak-empty">
              <FolderOpen size={48} strokeWidth={1.5} />
              <p>Belum terdapat dokumen kontrak yang tersedia saat ini.</p>
            </div>
          )}

          {!loading && !error && kontrakList.length > 0 && (
            <div className="kontrak-grid">
              {kontrakList.map((kontrak) => (
                <KontrakCard key={kontrak.id} kontrak={kontrak} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/KontrakPage.jsx
git commit -m "feat: add KontrakPage list view"
```

---

### Task 7: KontrakDetailPage

**Files:**
- Create: `src/pages/KontrakDetailPage.jsx`

- [ ] **Step 1: Create the KontrakDetailPage**

Create `src/pages/KontrakDetailPage.jsx`:

```jsx
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useKontrakById } from '../hooks/useKontrak';
import DokumenItem from '../components/DokumenItem';
import PdfViewer from '../components/PdfViewer';
import Footer from '../components/Footer';

const STATUS_LABELS = {
  aktif: 'Aktif',
  selesai: 'Selesai',
  'dalam-proses': 'Dalam Proses',
};

export default function KontrakDetailPage() {
  const { id } = useParams();
  const { kontrak, loading, error } = useKontrakById(id);
  const [previewDokumen, setPreviewDokumen] = useState(null);

  if (loading) {
    return (
      <div className="kontrak-detail-loading section">
        <div className="container">
          <p>Memuat data kontrak…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kontrak-detail-error section">
        <div className="container">
          <p>Gagal memuat data: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!kontrak) {
    return (
      <section className="section kontrak-not-found">
        <div className="container">
          <div className="kontrak-empty">
            <AlertCircle size={48} strokeWidth={1.5} />
            <h2>Kontrak Tidak Ditemukan</h2>
            <p>
              Kontrak dengan ID "{id}" tidak ditemukan. Silakan kembali ke
              daftar kontrak.
            </p>
            <Link to="/kontrak" className="btn btn-primary">
              <ArrowLeft size={18} strokeWidth={2.5} />
              Kembali ke Daftar Kontrak
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section kontrak-detail-section">
        <div className="container">
          <nav className="kontrak-breadcrumb" aria-label="Breadcrumb">
            <Link to="/kontrak" className="kontrak-breadcrumb-link">
              Kontrak
            </Link>
            <ChevronRight size={14} strokeWidth={2.5} aria-hidden="true" />
            <span className="kontrak-breadcrumb-current">
              {kontrak.nomorKontrak}
            </span>
          </nav>

          <div className="kontrak-detail-header">
            <div>
              <h1 className="kontrak-detail-title">
                Kontrak {kontrak.nomorKontrak}
              </h1>
              <p className="kontrak-detail-subtitle">{kontrak.namaProyek}</p>
            </div>
            <span
              className={`badge kontrak-status kontrak-status--${kontrak.status}`}
            >
              {STATUS_LABELS[kontrak.status] || kontrak.status}
            </span>
          </div>

          <div className="kontrak-detail-info">
            <span className="kontrak-detail-date">
              Tanggal:{' '}
              {new Date(kontrak.tanggal).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="kontrak-dokumen-section">
            <h2 className="kontrak-dokumen-heading">Dokumen Terkait</h2>
            <div className="kontrak-dokumen-list">
              {kontrak.dokumen.map((dok) => (
                <DokumenItem
                  key={dok.id}
                  dokumen={dok}
                  onPreview={setPreviewDokumen}
                  isActive={previewDokumen?.id === dok.id}
                />
              ))}
            </div>
          </div>

          {previewDokumen && (
            <PdfViewer
              dokumen={previewDokumen}
              onClose={() => setPreviewDokumen(null)}
            />
          )}

          <div className="kontrak-detail-back">
            <Link to="/kontrak" className="btn btn-secondary">
              <ArrowLeft size={18} strokeWidth={2.5} />
              Kembali ke Daftar Kontrak
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/KontrakDetailPage.jsx
git commit -m "feat: add KontrakDetailPage with PDF preview"
```

---

### Task 8: CSS Styles

**Files:**
- Modify: `src/styles/components.css` (append new classes after `.footer-contact-item svg` block, before the `@media` query)
- Modify: `src/styles/layouts.css` (append kontrak layout rules, add responsive rules inside the existing `@media (min-width: 768px)` block)

- [ ] **Step 1: Add kontrak component styles to components.css**

Open `src/styles/components.css`. Insert the following CSS **before** the `/* --- Desktop Responsive --- */` comment at line 519:

```css
/* --- Kontrak Card --- */
.kontrak-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--color-fg);
  cursor: pointer;
}

.kontrak-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kontrak-card-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-circle);
  margin-bottom: 0;
}

.kontrak-status {
  font-size: 0.65rem;
  padding: 0.25rem 0.6rem;
}

.kontrak-status--aktif {
  color: #166534;
  background-color: #dcfce7;
}

.kontrak-status--selesai {
  color: var(--color-secondary);
  background-color: var(--color-muted);
}

.kontrak-status--dalam-proses {
  color: #92400e;
  background-color: #fef3c7;
}

.kontrak-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.kontrak-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--color-secondary);
}

.kontrak-meta-item svg {
  display: inline;
}

/* --- Kontrak Empty / Loading / Error --- */
.kontrak-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: var(--color-secondary);
}

.kontrak-empty h2 {
  font-family: var(--font-heading);
  color: var(--color-fg);
}

.kontrak-loading,
.kontrak-error {
  text-align: center;
  padding: 3rem;
  color: var(--color-secondary);
}

/* --- Kontrak Breadcrumb --- */
.kontrak-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.85rem;
}

.kontrak-breadcrumb svg {
  display: inline;
  color: var(--color-secondary);
}

.kontrak-breadcrumb-link {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 600;
  transition: opacity var(--transition-speed);
}

.kontrak-breadcrumb-link:hover {
  opacity: 0.7;
}

.kontrak-breadcrumb-current {
  color: var(--color-secondary);
  font-weight: 500;
}

/* --- Kontrak Detail --- */
.kontrak-detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.kontrak-detail-title {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  margin-bottom: 0.25rem;
}

.kontrak-detail-subtitle {
  color: var(--color-secondary);
  font-size: 1.05rem;
}

.kontrak-detail-info {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.kontrak-detail-date {
  font-size: 0.9rem;
  color: var(--color-secondary);
}

.kontrak-detail-back {
  margin-top: 3rem;
}

/* --- Dokumen Item --- */
.dokumen-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background-color: var(--color-card-bg);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-speed) var(--transition-easing);
}

.dokumen-item:hover {
  box-shadow: var(--shadow-md);
}

.dokumen-item--active {
  box-shadow: var(--shadow-md);
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.dokumen-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-circle);
  background-color: var(--color-bg);
  box-shadow: var(--shadow-sm);
  color: var(--color-accent);
  flex-shrink: 0;
}

.dokumen-item-icon svg {
  display: inline;
}

.dokumen-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}

.dokumen-item-name {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dokumen-item-badge {
  width: fit-content;
  font-size: 0.6rem;
  padding: 0.15rem 0.5rem;
}

.dokumen-item-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.dokumen-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  min-height: 36px;
  gap: 0.35rem;
}

.dokumen-btn svg {
  display: inline;
}

.dokumen-btn-label {
  display: none;
}

/* --- PDF Viewer --- */
.pdf-viewer {
  margin-top: 2rem;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-recessed);
}

.pdf-viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background-color: #2d3436;
  color: #e0e5ec;
}

.pdf-viewer-title {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pdf-viewer-controls {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.pdf-viewer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  color: #e0e5ec;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color 150ms;
}

.pdf-viewer-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.pdf-viewer-iframe {
  width: 100%;
  height: 50vh;
  border: none;
  background-color: #f5f5f5;
}

.pdf-viewer-mobile-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  gap: 1.5rem;
  background-color: var(--color-muted);
}

.pdf-viewer-mobile-fallback p {
  color: var(--color-secondary);
  font-size: 0.95rem;
}

.pdf-viewer-mobile-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* --- Kontrak Section Heading --- */
.kontrak-dokumen-heading {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.35rem;
  margin-bottom: 1.25rem;
}
```

- [ ] **Step 2: Add kontrak layout rules to layouts.css**

Open `src/styles/layouts.css`. Add the following CSS **before** the existing `/* --- Desktop Responsive --- */` comment at line 519:

```css
/* --- Kontrak Grid --- */
.kontrak-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap);
}

.kontrak-dokumen-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
```

Then, **inside** the existing `@media (min-width: 768px)` block, add these rules alongside the other responsive overrides:

```css
  .kontrak-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dokumen-btn-label {
    display: inline;
  }

  .pdf-viewer-iframe {
    height: 70vh;
  }

  .dokumen-item {
    padding: 1.25rem 1.5rem;
  }
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/components.css src/styles/layouts.css
git commit -m "feat: add CSS styles for kontrak components and layouts"
```

---

### Task 9: Wire Up Routes & Navigation

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/BottomNav.jsx`

- [ ] **Step 1: Update App.jsx with new routes**

Open `src/App.jsx`. Make these changes:

1. Add imports after the existing `UnderConstruction` import:

```javascript
import KontrakPage from './pages/KontrakPage';
import KontrakDetailPage from './pages/KontrakDetailPage';
```

2. Replace the kontrak route inside `<Routes>`. Change:

```jsx
<Route path="/kontrak" element={<UnderConstruction title="Kontrak" />} />
```

To:

```jsx
<Route path="/kontrak" element={<KontrakPage />} />
<Route path="/kontrak/:id" element={<KontrakDetailPage />} />
```

The full `<Routes>` block should now be:

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/panduan" element={<UnderConstruction title="Panduan" />} />
  <Route path="/kontrak" element={<KontrakPage />} />
  <Route path="/kontrak/:id" element={<KontrakDetailPage />} />
  <Route path="/qna" element={<UnderConstruction title="Q & A" />} />
</Routes>
```

- [ ] **Step 2: Update BottomNav.jsx**

Open `src/components/BottomNav.jsx`. Make these changes:

1. Change the import line. Replace:

```javascript
import { Home, BookOpen, HardHat, HelpCircle } from 'lucide-react';
```

With:

```javascript
import { Home, BookOpen, FileText, HelpCircle } from 'lucide-react';
```

2. In the `NAV_ITEMS` array, replace the pekerjaan-beton item:

```javascript
{ path: '/pekerjaan-beton', label: 'Beton', icon: HardHat },
```

With:

```javascript
{ path: '/kontrak', label: 'Kontrak', icon: FileText },
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

Expected: Build succeeds with no errors. Output should show updated chunk sizes.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/components/BottomNav.jsx
git commit -m "feat: wire kontrak routes and update bottom nav"
```

---

### Task 10: Add Large-Screen Grid Breakpoint & Final Verification

**Files:**
- Modify: `src/styles/layouts.css`

- [ ] **Step 1: Add lg breakpoint for 3-column kontrak grid**

Open `src/styles/layouts.css`. Add a new media query **after** the existing `@media (min-width: 768px)` closing brace:

```css
@media (min-width: 1024px) {
  .kontrak-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

- [ ] **Step 2: Run final build verification**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 3: Run dev server and visually verify**

Run: `npm run dev`

Verify the following in the browser:

1. Navigate to `/kontrak` — should show "Dokumentasi Kontrak" heading with two contract cards
2. Click a card — should navigate to `/kontrak/002-pj-2025` showing contract details and document list
3. Click "Preview" on a document — should show embedded PDF viewer (desktop) or fallback buttons (mobile)
4. Click "Download" — should trigger file download
5. Click "Kembali ke Daftar Kontrak" — should navigate back to `/kontrak`
6. On mobile viewport (< 768px), bottom nav should show "Kontrak" instead of "Beton"
7. Breadcrumb navigation works on detail page

- [ ] **Step 4: Commit**

```bash
git add src/styles/layouts.css
git commit -m "feat: add 3-column kontrak grid for large screens"
```

- [ ] **Step 5: Final commit — tag Phase A complete**

```bash
git add -A
git commit -m "feat: complete Phase A — halaman kontrak public with PDF preview"
```

---

## Summary

| Task | What it does | Files |
|---|---|---|
| 1 | Static data config | `src/data/kontrak.js` |
| 2 | Data abstraction hook | `src/hooks/useKontrak.js` |
| 3 | Card component | `src/components/KontrakCard.jsx` |
| 4 | Document row component | `src/components/DokumenItem.jsx` |
| 5 | PDF viewer component | `src/components/PdfViewer.jsx` |
| 6 | List page | `src/pages/KontrakPage.jsx` |
| 7 | Detail page | `src/pages/KontrakDetailPage.jsx` |
| 8 | CSS styles | `src/styles/components.css`, `src/styles/layouts.css` |
| 9 | Routes & bottom nav | `src/App.jsx`, `src/components/BottomNav.jsx` |
| 10 | Large-screen grid + final verification | `src/styles/layouts.css` |
