# Phase C: Admin Kontrak Management + User Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin CRUD kontrak management with document upload (C1), migrate kontrak data to Appwrite DB with fallback (C2), and build user dashboard (C2).

**Tech Stack:** React 19, react-router-dom 7, appwrite (Web SDK — Client, Account, Functions, Databases, Storage), node-appwrite (Server SDK in Cloud Function — Client, Databases, Storage, Query, ID), lucide-react, CSS custom properties (Industrial Skeuomorphism theme).

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `functions/manage-kontrak/package.json` | Cloud Function dependencies |
| `functions/manage-kontrak/src/main.js` | Cloud Function entry point — REST-like router for kontrak + dokumen CRUD |
| `src/hooks/useAdminKontrak.js` | Custom hook — invoke Cloud Function + direct Storage SDK for admin kontrak ops |
| `src/components/admin/KontrakAdminTable.jsx` | Kontrak list table with status badges and action buttons |
| `src/components/admin/KontrakFormModal.jsx` | Modal for creating/editing kontrak |
| `src/components/admin/DokumenManager.jsx` | Panel for listing, uploading, and deleting dokumen within a kontrak |
| `src/pages/UserDashboard.jsx` | Dashboard page for authenticated pegawai PLN |

### Modified Files

| File | Change |
|---|---|
| `.env.example` | Add Database, Collection, Bucket, and Function env vars |
| `src/lib/appwrite.js` | Add `Databases` and `Storage` imports and exports |
| `src/pages/AdminDashboard.jsx` | Add "Manajemen Kontrak" section below user management |
| `src/styles/components.css` | Add kontrak admin table, dokumen manager, status badges, user dashboard CSS |
| `src/styles/layouts.css` | Add responsive rules for dokumen manager and dashboard cards |
| `src/hooks/useKontrak.js` | Migrate to Appwrite Database with static fallback |
| `src/App.jsx` | Replace `/dashboard` placeholder with `UserDashboard` |

---

## Sub-Phase C1: Admin Kontrak Management

### Task 1: Cloud Function — manage-kontrak

**Files:**
- Create: `functions/manage-kontrak/package.json`
- Create: `functions/manage-kontrak/src/main.js`

- [ ] **Step 1: Create package.json**

Create `functions/manage-kontrak/package.json`:

```json
{
  "name": "manage-kontrak",
  "version": "1.0.0",
  "type": "module",
  "main": "src/main.js",
  "dependencies": {
    "node-appwrite": ">=14.0.0"
  }
}
```

- [ ] **Step 2: Create main.js**

Create `functions/manage-kontrak/src/main.js`:

```javascript
import { Client, Databases, Storage, ID, Query } from 'node-appwrite';

const DB_ID = () => process.env.APPWRITE_DATABASE_ID;
const COL_KONTRAK = () => process.env.APPWRITE_COLLECTION_KONTRAK;
const COL_DOKUMEN = () => process.env.APPWRITE_COLLECTION_DOKUMEN;
const BUCKET_KONTRAK = () => process.env.APPWRITE_BUCKET_KONTRAK;

function initClient() {
  return new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
}

function parseBody(req) {
  if (!req.body || req.body === '') return {};
  try {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return {};
  }
}

function matchRoute(path) {
  let match;

  match = path.match(/^\/kontrak\/([^/]+)\/dokumen$/);
  if (match) return { type: 'kontrak-dokumen', kontrakId: match[1] };

  match = path.match(/^\/kontrak\/([^/]+)$/);
  if (match) return { type: 'kontrak-id', id: match[1] };

  if (path === '/kontrak') return { type: 'kontrak' };

  match = path.match(/^\/dokumen\/([^/]+)$/);
  if (match) return { type: 'dokumen-id', id: match[1] };

  return { type: null };
}

const VALID_STATUS = ['aktif', 'selesai', 'dalam-proses'];
const VALID_TIPE = ['approval-drawing', 'boq', 'lainnya'];

async function handleListKontrak(databases, req) {
  const search = req.query?.search || '';
  const limit = Math.min(parseInt(req.query?.limit) || 25, 100);
  const offset = parseInt(req.query?.offset) || 0;

  const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')];
  if (search) queries.push(Query.search('namaProyek', search));

  const kontrakResult = await databases.listDocuments(DB_ID(), COL_KONTRAK(), queries);

  const kontrakWithDocs = await Promise.all(
    kontrakResult.documents.map(async (k) => {
      const docsResult = await databases.listDocuments(DB_ID(), COL_DOKUMEN(), [
        Query.equal('kontrakId', k.$id),
        Query.limit(100),
      ]);
      return {
        $id: k.$id,
        nomorKontrak: k.nomorKontrak,
        namaProyek: k.namaProyek,
        tanggal: k.tanggal,
        status: k.status,
        dokumen: docsResult.documents.map((d) => ({
          $id: d.$id,
          tipe: d.tipe,
          nama: d.nama,
          fileId: d.fileId || null,
          path: d.path || null,
          sumber: d.sumber,
          kontrakId: d.kontrakId,
        })),
      };
    })
  );

  return { total: kontrakResult.total, kontrak: kontrakWithDocs };
}

async function handleCreateKontrak(databases, req) {
  const { nomorKontrak, namaProyek, tanggal, status } = parseBody(req);

  if (!nomorKontrak || !nomorKontrak.trim())
    return { _status: 400, error: 'Nomor kontrak wajib diisi.' };
  if (!namaProyek || !namaProyek.trim())
    return { _status: 400, error: 'Nama proyek wajib diisi.' };
  if (!tanggal) return { _status: 400, error: 'Tanggal wajib diisi.' };
  if (!VALID_STATUS.includes(status))
    return { _status: 400, error: 'Status harus aktif, selesai, atau dalam-proses.' };

  const doc = await databases.createDocument(DB_ID(), COL_KONTRAK(), ID.unique(), {
    nomorKontrak: nomorKontrak.trim(),
    namaProyek: namaProyek.trim(),
    tanggal,
    status,
  });

  return {
    $id: doc.$id,
    nomorKontrak: doc.nomorKontrak,
    namaProyek: doc.namaProyek,
    tanggal: doc.tanggal,
    status: doc.status,
    dokumen: [],
  };
}

async function handleUpdateKontrak(databases, kontrakId, req) {
  try {
    await databases.getDocument(DB_ID(), COL_KONTRAK(), kontrakId);
  } catch {
    return { _status: 404, error: 'Kontrak tidak ditemukan.' };
  }

  const body = parseBody(req);
  const data = {};
  if (body.nomorKontrak !== undefined && body.nomorKontrak.trim())
    data.nomorKontrak = body.nomorKontrak.trim();
  if (body.namaProyek !== undefined && body.namaProyek.trim())
    data.namaProyek = body.namaProyek.trim();
  if (body.tanggal !== undefined) data.tanggal = body.tanggal;
  if (body.status !== undefined) {
    if (!VALID_STATUS.includes(body.status))
      return { _status: 400, error: 'Status harus aktif, selesai, atau dalam-proses.' };
    data.status = body.status;
  }

  const updated = await databases.updateDocument(DB_ID(), COL_KONTRAK(), kontrakId, data);
  return {
    $id: updated.$id,
    nomorKontrak: updated.nomorKontrak,
    namaProyek: updated.namaProyek,
    tanggal: updated.tanggal,
    status: updated.status,
  };
}

async function handleDeleteKontrak(databases, storage, kontrakId) {
  try {
    await databases.getDocument(DB_ID(), COL_KONTRAK(), kontrakId);
  } catch {
    return { _status: 404, error: 'Kontrak tidak ditemukan.' };
  }

  const docsResult = await databases.listDocuments(DB_ID(), COL_DOKUMEN(), [
    Query.equal('kontrakId', kontrakId),
    Query.limit(500),
  ]);

  for (const doc of docsResult.documents) {
    if (doc.sumber === 'appwrite' && doc.fileId) {
      try {
        await storage.deleteFile(BUCKET_KONTRAK(), doc.fileId);
      } catch {
        /* file may already be deleted */
      }
    }
    await databases.deleteDocument(DB_ID(), COL_DOKUMEN(), doc.$id);
  }

  await databases.deleteDocument(DB_ID(), COL_KONTRAK(), kontrakId);
  return { success: true };
}

async function handleAddDokumen(databases, kontrakId, req) {
  try {
    await databases.getDocument(DB_ID(), COL_KONTRAK(), kontrakId);
  } catch {
    return { _status: 404, error: 'Kontrak tidak ditemukan.' };
  }

  const { tipe, nama, fileId, sumber } = parseBody(req);

  if (!nama || !nama.trim()) return { _status: 400, error: 'Nama dokumen wajib diisi.' };
  if (!VALID_TIPE.includes(tipe))
    return { _status: 400, error: 'Tipe harus approval-drawing, boq, atau lainnya.' };
  if (!['lokal', 'appwrite'].includes(sumber))
    return { _status: 400, error: 'Sumber harus lokal atau appwrite.' };
  if (sumber === 'appwrite' && !fileId)
    return { _status: 400, error: 'fileId wajib untuk sumber appwrite.' };

  const data = {
    kontrakId,
    tipe,
    nama: nama.trim(),
    sumber,
  };
  if (fileId) data.fileId = fileId;

  const doc = await databases.createDocument(DB_ID(), COL_DOKUMEN(), ID.unique(), data);
  return {
    $id: doc.$id,
    tipe: doc.tipe,
    nama: doc.nama,
    fileId: doc.fileId || null,
    path: doc.path || null,
    sumber: doc.sumber,
    kontrakId: doc.kontrakId,
  };
}

async function handleDeleteDokumen(databases, storage, dokumenId) {
  let doc;
  try {
    doc = await databases.getDocument(DB_ID(), COL_DOKUMEN(), dokumenId);
  } catch {
    return { _status: 404, error: 'Dokumen tidak ditemukan.' };
  }

  if (doc.sumber === 'lokal') {
    return { _status: 403, error: 'Dokumen lokal tidak dapat dihapus via admin.' };
  }

  if (doc.sumber === 'appwrite' && doc.fileId) {
    try {
      await storage.deleteFile(BUCKET_KONTRAK(), doc.fileId);
    } catch {
      /* file may already be deleted */
    }
  }

  await databases.deleteDocument(DB_ID(), COL_DOKUMEN(), dokumenId);
  return { success: true };
}

export default async ({ req, res, log, error }) => {
  try {
    const client = initClient();
    const databases = new Databases(client);
    const storage = new Storage(client);

    const method = req.method;
    const path = req.path || '/';
    const route = matchRoute(path);

    let result;

    if (route.type === 'kontrak' && method === 'GET') {
      result = await handleListKontrak(databases, req);
    } else if (route.type === 'kontrak' && method === 'POST') {
      result = await handleCreateKontrak(databases, req);
    } else if (route.type === 'kontrak-id' && method === 'PATCH') {
      result = await handleUpdateKontrak(databases, route.id, req);
    } else if (route.type === 'kontrak-id' && method === 'DELETE') {
      result = await handleDeleteKontrak(databases, storage, route.id);
    } else if (route.type === 'kontrak-dokumen' && method === 'POST') {
      result = await handleAddDokumen(databases, route.kontrakId, req);
    } else if (route.type === 'dokumen-id' && method === 'DELETE') {
      result = await handleDeleteDokumen(databases, storage, route.id);
    } else {
      return res.json({ error: 'Route tidak ditemukan.' }, 404);
    }

    const status = result._status || 200;
    if (result._status) delete result._status;
    return res.json(result, status);
  } catch (err) {
    error('Function error: ' + err.message);
    return res.json({ error: err.message || 'Terjadi kesalahan server.' }, 500);
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add functions/manage-kontrak/
git commit -m "feat: add manage-kontrak Cloud Function for kontrak + dokumen CRUD"
```

---

### Task 2: Environment & Appwrite Client Update

**Files:**
- Modify: `.env.example`
- Modify: `src/lib/appwrite.js`

- [ ] **Step 1: Update .env.example**

Append to `.env.example` (after the existing `VITE_APPWRITE_FUNCTION_MANAGE_USERS` line):

```
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_COLLECTION_KONTRAK=your-kontrak-collection-id
VITE_APPWRITE_COLLECTION_DOKUMEN=your-dokumen-collection-id
VITE_APPWRITE_BUCKET_KONTRAK=your-bucket-id
VITE_APPWRITE_FUNCTION_MANAGE_KONTRAK=your-function-id
```

The full file should look like:

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id-here
VITE_APPWRITE_FUNCTION_MANAGE_USERS=your-function-id-here
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_COLLECTION_KONTRAK=your-kontrak-collection-id
VITE_APPWRITE_COLLECTION_DOKUMEN=your-dokumen-collection-id
VITE_APPWRITE_BUCKET_KONTRAK=your-bucket-id
VITE_APPWRITE_FUNCTION_MANAGE_KONTRAK=your-function-id
```

- [ ] **Step 2: Update appwrite.js**

Open `src/lib/appwrite.js`. Change the import:

```javascript
import { Client, Account, Functions, ID } from 'appwrite';
```

To:

```javascript
import { Client, Account, Functions, Databases, Storage, ID } from 'appwrite';
```

Then before the existing `export` line, add these new instances:

```javascript
const databases = new Databases(client);

const storage = new Storage(client);
```

Then update the export:

```javascript
export { client, account, functions, databases, storage, ID };
```

The full file should be:

```javascript
import { Client, Account, Functions, Databases, Storage, ID } from 'appwrite';

const client = new Client();

if (import.meta.env.VITE_APPWRITE_ENDPOINT && import.meta.env.VITE_APPWRITE_PROJECT_ID) {
  client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
} else if (import.meta.env.DEV) {
  console.warn(
    '[Appwrite] Missing VITE_APPWRITE_ENDPOINT or VITE_APPWRITE_PROJECT_ID. ' +
    'Copy .env.example to .env and fill in your project values.'
  );
}

const account = new Account(client);

const functions = new Functions(client);

const databases = new Databases(client);

const storage = new Storage(client);

export { client, account, functions, databases, storage, ID };
```

- [ ] **Step 3: Commit**

```bash
git add .env.example src/lib/appwrite.js
git commit -m "feat: add Databases + Storage SDK exports and kontrak env vars"
```

---

### Task 3: useAdminKontrak Hook

**Files:**
- Create: `src/hooks/useAdminKontrak.js`

- [ ] **Step 1: Create useAdminKontrak.js**

Create `src/hooks/useAdminKontrak.js`:

```javascript
import { useState, useCallback } from 'react';
import { functions, storage, ID } from '../lib/appwrite.js';

const FUNCTION_ID = import.meta.env.VITE_APPWRITE_FUNCTION_MANAGE_KONTRAK;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_KONTRAK;

if (import.meta.env.DEV && !FUNCTION_ID) {
  console.warn('[useAdminKontrak] VITE_APPWRITE_FUNCTION_MANAGE_KONTRAK is not set.');
}

if (import.meta.env.DEV && !BUCKET_ID) {
  console.warn('[useAdminKontrak] VITE_APPWRITE_BUCKET_KONTRAK is not set.');
}

async function callManageKontrak(method, path, body = null) {
  const params = {
    functionId: FUNCTION_ID,
    method,
    xpath: path,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) params.body = JSON.stringify(body);

  const execution = await functions.createExecution(params);

  let response;
  try {
    response = JSON.parse(execution.responseBody);
  } catch {
    throw new Error('Respons server tidak valid. Silakan coba lagi.');
  }

  if (execution.responseStatusCode >= 400) {
    throw new Error(response.error || 'Terjadi kesalahan.');
  }
  return response;
}

export function useAdminKontrak() {
  const [kontrakList, setKontrakList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchKontrak = useCallback(async (search = '', limit = 25, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      const qs = params.toString();
      const result = await callManageKontrak('GET', `/kontrak?${qs}`);
      setKontrakList(result.kontrak);
      setTotal(result.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createKontrak = useCallback(async (data) => {
    const result = await callManageKontrak('POST', '/kontrak', data);
    return result;
  }, []);

  const updateKontrak = useCallback(async (id, data) => {
    const result = await callManageKontrak('PATCH', `/kontrak/${id}`, data);
    return result;
  }, []);

  const deleteKontrak = useCallback(async (id) => {
    const result = await callManageKontrak('DELETE', `/kontrak/${id}`);
    return result;
  }, []);

  const addDokumen = useCallback(async (kontrakId, data) => {
    const result = await callManageKontrak('POST', `/kontrak/${kontrakId}/dokumen`, data);
    return result;
  }, []);

  const deleteDokumen = useCallback(async (id) => {
    const result = await callManageKontrak('DELETE', `/dokumen/${id}`);
    return result;
  }, []);

  const uploadFile = useCallback(async (file) => {
    const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return result.$id;
  }, []);

  const deleteFile = useCallback(async (fileId) => {
    await storage.deleteFile(BUCKET_ID, fileId);
  }, []);

  const getFileUrl = useCallback((fileId) => {
    return storage.getFileView(BUCKET_ID, fileId);
  }, []);

  return {
    kontrakList,
    total,
    loading,
    error,
    fetchKontrak,
    createKontrak,
    updateKontrak,
    deleteKontrak,
    addDokumen,
    deleteDokumen,
    uploadFile,
    deleteFile,
    getFileUrl,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAdminKontrak.js
git commit -m "feat: add useAdminKontrak hook for Cloud Function + Storage CRUD"
```

---

### Task 4: KontrakAdminTable Component

**Files:**
- Create: `src/components/admin/KontrakAdminTable.jsx`

- [ ] **Step 1: Create KontrakAdminTable.jsx**

Create `src/components/admin/KontrakAdminTable.jsx`:

```jsx
import { Pencil, FileText, Trash2 } from 'lucide-react';

const STATUS_LABELS = {
  aktif: 'Aktif',
  selesai: 'Selesai',
  'dalam-proses': 'Dalam Proses',
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const modifier = status || 'aktif';
  return (
    <span className={`kontrak-status-badge kontrak-status-badge--${modifier}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function KontrakAdminTable({ kontrak, loading, onEdit, onManageDocs, onDelete }) {
  if (loading) {
    return (
      <div className="admin-table-loading">
        <div className="auth-loading-spinner" />
        <p>Memuat data kontrak...</p>
      </div>
    );
  }

  if (!kontrak || kontrak.length === 0) {
    return (
      <div className="admin-table-empty">
        <p>Belum ada data kontrak.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>No. Kontrak</th>
            <th>Nama Proyek</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th>Dokumen</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {kontrak.map((k) => (
            <tr key={k.$id}>
              <td className="admin-table-name">{k.nomorKontrak}</td>
              <td>{k.namaProyek}</td>
              <td className="admin-table-date">{formatDate(k.tanggal)}</td>
              <td><StatusBadge status={k.status} /></td>
              <td>{k.dokumen?.length || 0}</td>
              <td className="admin-table-actions">
                <button
                  className="admin-action-btn"
                  onClick={() => onEdit(k)}
                  aria-label={`Edit ${k.namaProyek}`}
                >
                  <Pencil size={16} strokeWidth={2} />
                </button>
                <button
                  className="admin-action-btn"
                  onClick={() => onManageDocs(k)}
                  aria-label={`Kelola dokumen ${k.namaProyek}`}
                >
                  <FileText size={16} strokeWidth={2} />
                </button>
                <button
                  className="admin-action-btn admin-action-btn--danger"
                  onClick={() => onDelete(k)}
                  aria-label={`Hapus ${k.namaProyek}`}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/KontrakAdminTable.jsx
git commit -m "feat: add KontrakAdminTable component for admin dashboard"
```

---

### Task 5: KontrakFormModal Component

**Files:**
- Create: `src/components/admin/KontrakFormModal.jsx`

- [ ] **Step 1: Create KontrakFormModal.jsx**

Create `src/components/admin/KontrakFormModal.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function KontrakFormModal({ open, kontrak, onClose, onSubmit, submitting, externalError = '' }) {
  const isEdit = kontrak !== null;
  const [nomorKontrak, setNomorKontrak] = useState('');
  const [namaProyek, setNamaProyek] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [status, setStatus] = useState('aktif');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (kontrak) {
        setNomorKontrak(kontrak.nomorKontrak || '');
        setNamaProyek(kontrak.namaProyek || '');
        setTanggal(kontrak.tanggal || '');
        setStatus(kontrak.status || 'aktif');
      } else {
        setNomorKontrak('');
        setNamaProyek('');
        setTanggal('');
        setStatus('aktif');
      }
      setError('');
    }
  }, [open, kontrak]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!nomorKontrak.trim()) { setError('Nomor kontrak wajib diisi.'); return; }
    if (!namaProyek.trim()) { setError('Nama proyek wajib diisi.'); return; }
    if (!tanggal) { setError('Tanggal wajib diisi.'); return; }

    onSubmit({
      nomorKontrak: nomorKontrak.trim(),
      namaProyek: namaProyek.trim(),
      tanggal,
      status,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div
        className="modal-content card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kontrak-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="kontrak-form-title" className="modal-title">
            {isEdit ? 'Edit Kontrak' : 'Tambah Kontrak Baru'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="kontrak-nomor" className="login-label">Nomor Kontrak</label>
            <input
              id="kontrak-nomor"
              type="text"
              className="login-input"
              placeholder="Contoh: 002.PJ.2025"
              value={nomorKontrak}
              onChange={(e) => setNomorKontrak(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="kontrak-nama" className="login-label">Nama Proyek</label>
            <input
              id="kontrak-nama"
              type="text"
              className="login-input"
              placeholder="Masukkan nama proyek"
              value={namaProyek}
              onChange={(e) => setNamaProyek(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="kontrak-tanggal" className="login-label">Tanggal</label>
            <input
              id="kontrak-tanggal"
              type="date"
              className="login-input"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="kontrak-status" className="login-label">Status</label>
            <select
              id="kontrak-status"
              className="login-input admin-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting}
            >
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="dalam-proses">Dalam Proses</option>
            </select>
          </div>

          {(error || externalError) && (
            <div className="login-error" role="alert">
              <AlertCircle size={16} strokeWidth={2.5} />
              <span>{error || externalError}</span>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn modal-btn-cancel" onClick={onClose} disabled={submitting}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? 'Memproses...'
                : isEdit ? 'Simpan Perubahan' : 'Tambah Kontrak'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/KontrakFormModal.jsx
git commit -m "feat: add KontrakFormModal for create/edit kontrak"
```

---

### Task 6: DokumenManager Component

**Files:**
- Create: `src/components/admin/DokumenManager.jsx`

- [ ] **Step 1: Create DokumenManager.jsx**

Create `src/components/admin/DokumenManager.jsx`:

```jsx
import { useState } from 'react';
import { X, FileText, Upload, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const TIPE_OPTIONS = [
  { value: 'approval-drawing', label: 'Approval Drawing' },
  { value: 'boq', label: 'BOQ' },
  { value: 'lainnya', label: 'Lainnya' },
];

function SumberBadge({ sumber }) {
  return (
    <span className={`sumber-badge sumber-badge--${sumber}`}>
      {sumber === 'lokal' ? 'Lokal' : 'Cloud'}
    </span>
  );
}

function TipeBadge({ tipe }) {
  const label = TIPE_OPTIONS.find((t) => t.value === tipe)?.label || tipe;
  return <span className="dokumen-item-badge badge">{label}</span>;
}

export default function DokumenManager({ open, kontrak, onClose, onRefresh, adminHook }) {
  const { addDokumen, deleteDokumen, uploadFile } = adminHook;

  const [nama, setNama] = useState('');
  const [tipe, setTipe] = useState('approval-drawing');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  if (!open || !kontrak) return null;

  const dokumenList = kontrak.dokumen || [];

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!nama.trim()) { setUploadError('Nama dokumen wajib diisi.'); return; }
    if (!file) { setUploadError('Pilih file PDF untuk diunggah.'); return; }

    setUploading(true);
    try {
      const fileId = await uploadFile(file);
      await addDokumen(kontrak.$id, {
        tipe,
        nama: nama.trim(),
        fileId,
        sumber: 'appwrite',
      });
      setNama('');
      setTipe('approval-drawing');
      setFile(null);
      setUploadSuccess('Dokumen berhasil diunggah.');
      onRefresh();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (dokId) => {
    setDeletingId(dokId);
    setUploadError('');
    try {
      await deleteDokumen(dokId);
      onRefresh();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div
        className="dokumen-manager modal-content card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dokumen-manager-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="dokumen-manager-title" className="modal-title">
            Dokumen — {kontrak.nomorKontrak}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="modal-body">
          {/* Existing dokumen list */}
          <div className="dokumen-manager-list">
            {dokumenList.length === 0 && (
              <p className="admin-table-empty" style={{ padding: '1.5rem' }}>
                Belum ada dokumen.
              </p>
            )}
            {dokumenList.map((dok) => (
              <div className="dokumen-manager-item" key={dok.$id}>
                <div className="dokumen-manager-item-icon">
                  <FileText size={18} strokeWidth={2} />
                </div>
                <div className="dokumen-manager-item-info">
                  <span className="dokumen-manager-item-name">{dok.nama}</span>
                  <div className="dokumen-manager-item-badges">
                    <TipeBadge tipe={dok.tipe} />
                    <SumberBadge sumber={dok.sumber} />
                  </div>
                </div>
                {dok.sumber === 'appwrite' && (
                  <button
                    className="admin-action-btn admin-action-btn--danger"
                    onClick={() => handleDelete(dok.$id)}
                    disabled={deletingId === dok.$id}
                    aria-label={`Hapus ${dok.nama}`}
                  >
                    {deletingId === dok.$id
                      ? <div className="auth-loading-spinner" style={{ width: '1rem', height: '1rem' }} />
                      : <Trash2 size={16} strokeWidth={2} />
                    }
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload form */}
          <form className="dokumen-upload-form" onSubmit={handleUpload}>
            <h3 className="dokumen-upload-heading">Unggah Dokumen Baru</h3>

            <div className="login-field">
              <label htmlFor="dok-nama" className="login-label">Nama Dokumen</label>
              <input
                id="dok-nama"
                type="text"
                className="login-input"
                placeholder="Contoh: Approval Drawing 002.PJ.2025"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                disabled={uploading}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="dok-tipe" className="login-label">Tipe Dokumen</label>
              <select
                id="dok-tipe"
                className="login-input admin-select"
                value={tipe}
                onChange={(e) => setTipe(e.target.value)}
                disabled={uploading}
              >
                {TIPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="login-field">
              <label htmlFor="dok-file" className="login-label">File PDF</label>
              <div className="file-input-wrapper">
                <input
                  id="dok-file"
                  type="file"
                  accept=".pdf"
                  className="login-input"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={uploading}
                  required
                />
              </div>
            </div>

            {uploadError && (
              <div className="login-error" role="alert">
                <AlertCircle size={16} strokeWidth={2.5} />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="upload-success" role="status">
                <CheckCircle size={16} strokeWidth={2.5} />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={uploading} style={{ alignSelf: 'flex-start' }}>
              {uploading ? (
                <>
                  <div className="auth-loading-spinner" style={{ width: '1rem', height: '1rem' }} />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <Upload size={18} strokeWidth={2.5} />
                  <span>Unggah Dokumen</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/DokumenManager.jsx
git commit -m "feat: add DokumenManager for document upload and management"
```

---

### Task 7: Update AdminDashboard Page

**Files:**
- Modify: `src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Update AdminDashboard.jsx**

Replace the entire contents of `src/pages/AdminDashboard.jsx` with:

```jsx
import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Plus, AlertCircle } from 'lucide-react';
import { useUsers } from '../hooks/useUsers.js';
import { useAdminKontrak } from '../hooks/useAdminKontrak.js';
import UserTable from '../components/admin/UserTable';
import UserFormModal from '../components/admin/UserFormModal';
import DeleteConfirmModal from '../components/admin/DeleteConfirmModal';
import KontrakAdminTable from '../components/admin/KontrakAdminTable';
import KontrakFormModal from '../components/admin/KontrakFormModal';
import DokumenManager from '../components/admin/DokumenManager';

const PAGE_SIZE = 10;

export default function AdminDashboard() {
  /* ---- User Management State ---- */
  const { users, total: userTotal, loading: userLoading, error: userError, fetchUsers, createUser, updateUser, deleteUser } = useUsers();

  const [userSearch, setUserSearch] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userFormSubmitting, setUserFormSubmitting] = useState(false);
  const [userFormError, setUserFormError] = useState('');

  const userOffset = (userPage - 1) * PAGE_SIZE;
  const userTotalPages = Math.ceil(userTotal / PAGE_SIZE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearch(userSearch);
      setUserPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const refreshUsers = useCallback(() => {
    fetchUsers(debouncedUserSearch, PAGE_SIZE, userOffset);
  }, [fetchUsers, debouncedUserSearch, userOffset]);

  useEffect(() => { refreshUsers(); }, [refreshUsers]);

  const handleCreateUser = async (data) => {
    setUserFormSubmitting(true);
    setUserFormError('');
    try {
      await createUser(data);
      setShowCreateUserModal(false);
      refreshUsers();
    } catch (err) {
      setUserFormError(err.message);
    } finally {
      setUserFormSubmitting(false);
    }
  };

  const handleUpdateUser = async (data) => {
    if (!editingUser) return;
    setUserFormSubmitting(true);
    setUserFormError('');
    try {
      await updateUser(editingUser.$id, data);
      setEditingUser(null);
      refreshUsers();
    } catch (err) {
      setUserFormError(err.message);
    } finally {
      setUserFormSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setUserFormSubmitting(true);
    setUserFormError('');
    try {
      await deleteUser(deletingUser.$id);
      setDeletingUser(null);
      refreshUsers();
    } catch (err) {
      setUserFormError(err.message);
    } finally {
      setUserFormSubmitting(false);
    }
  };

  /* ---- Kontrak Management State ---- */
  const adminKontrak = useAdminKontrak();
  const { kontrakList, total: kontrakTotal, loading: kontrakLoading, error: kontrakError, fetchKontrak, createKontrak, updateKontrak, deleteKontrak: deleteKontrakFn } = adminKontrak;

  const [kontrakSearch, setKontrakSearch] = useState('');
  const [debouncedKontrakSearch, setDebouncedKontrakSearch] = useState('');
  const [kontrakPage, setKontrakPage] = useState(1);
  const [showCreateKontrakModal, setShowCreateKontrakModal] = useState(false);
  const [editingKontrak, setEditingKontrak] = useState(null);
  const [deletingKontrak, setDeletingKontrak] = useState(null);
  const [dokumenKontrak, setDokumenKontrak] = useState(null);
  const [kontrakFormSubmitting, setKontrakFormSubmitting] = useState(false);
  const [kontrakFormError, setKontrakFormError] = useState('');

  const kontrakOffset = (kontrakPage - 1) * PAGE_SIZE;
  const kontrakTotalPages = Math.ceil(kontrakTotal / PAGE_SIZE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKontrakSearch(kontrakSearch);
      setKontrakPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [kontrakSearch]);

  const refreshKontrak = useCallback(() => {
    fetchKontrak(debouncedKontrakSearch, PAGE_SIZE, kontrakOffset);
  }, [fetchKontrak, debouncedKontrakSearch, kontrakOffset]);

  useEffect(() => { refreshKontrak(); }, [refreshKontrak]);

  const handleCreateKontrak = async (data) => {
    setKontrakFormSubmitting(true);
    setKontrakFormError('');
    try {
      await createKontrak(data);
      setShowCreateKontrakModal(false);
      refreshKontrak();
    } catch (err) {
      setKontrakFormError(err.message);
    } finally {
      setKontrakFormSubmitting(false);
    }
  };

  const handleUpdateKontrak = async (data) => {
    if (!editingKontrak) return;
    setKontrakFormSubmitting(true);
    setKontrakFormError('');
    try {
      await updateKontrak(editingKontrak.$id, data);
      setEditingKontrak(null);
      refreshKontrak();
    } catch (err) {
      setKontrakFormError(err.message);
    } finally {
      setKontrakFormSubmitting(false);
    }
  };

  const handleDeleteKontrak = async () => {
    if (!deletingKontrak) return;
    setKontrakFormSubmitting(true);
    setKontrakFormError('');
    try {
      await deleteKontrakFn(deletingKontrak.$id);
      setDeletingKontrak(null);
      refreshKontrak();
    } catch (err) {
      setKontrakFormError(err.message);
    } finally {
      setKontrakFormSubmitting(false);
    }
  };

  const handleDokumenRefresh = () => {
    refreshKontrak();
    if (dokumenKontrak) {
      const updated = kontrakList.find((k) => k.$id === dokumenKontrak.$id);
      if (updated) setDokumenKontrak(updated);
    }
  };

  useEffect(() => {
    if (dokumenKontrak) {
      const updated = kontrakList.find((k) => k.$id === dokumenKontrak.$id);
      if (updated) setDokumenKontrak(updated);
    }
  }, [kontrakList, dokumenKontrak]);

  return (
    <section className="section admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Dashboard Admin</h1>
          <p className="admin-subtitle">Manajemen Sistem CIVIL QTRACK UPT Malang</p>
        </div>

        {/* ---- User Management Section ---- */}
        <div className="admin-section card">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Manajemen User</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateUserModal(true)}>
              <UserPlus size={18} strokeWidth={2.5} />
              <span>Tambah User</span>
            </button>
          </div>

          <div className="admin-search-row">
            <div className="admin-search-field">
              <Search size={18} strokeWidth={2} className="admin-search-icon" />
              <input
                type="text"
                className="login-input admin-search-input"
                placeholder="Cari berdasarkan nama..."
                aria-label="Cari user berdasarkan nama"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          {userError && (
            <div className="login-error" role="alert" style={{ margin: '0 0 1rem' }}>
              <AlertCircle size={16} strokeWidth={2.5} />
              <span>{userError}</span>
            </div>
          )}

          <UserTable
            users={users}
            loading={userLoading}
            onEdit={setEditingUser}
            onDelete={setDeletingUser}
          />

          {userTotalPages > 1 && (
            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Menampilkan {userOffset + 1}–{Math.min(userOffset + PAGE_SIZE, userTotal)} dari {userTotal} user
              </span>
              <div className="admin-pagination-buttons">
                <button
                  className="btn admin-pagination-btn"
                  disabled={userPage <= 1}
                  onClick={() => setUserPage((p) => p - 1)}
                >
                  Sebelumnya
                </button>
                <button
                  className="btn admin-pagination-btn"
                  disabled={userPage >= userTotalPages}
                  onClick={() => setUserPage((p) => p + 1)}
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---- Kontrak Management Section ---- */}
        <div className="admin-section card" style={{ marginTop: '2rem' }}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Manajemen Kontrak</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateKontrakModal(true)}>
              <Plus size={18} strokeWidth={2.5} />
              <span>Tambah Kontrak</span>
            </button>
          </div>

          <div className="admin-search-row">
            <div className="admin-search-field">
              <Search size={18} strokeWidth={2} className="admin-search-icon" />
              <input
                type="text"
                className="login-input admin-search-input"
                placeholder="Cari berdasarkan nama proyek..."
                aria-label="Cari kontrak berdasarkan nama proyek"
                value={kontrakSearch}
                onChange={(e) => setKontrakSearch(e.target.value)}
              />
            </div>
          </div>

          {kontrakError && (
            <div className="login-error" role="alert" style={{ margin: '0 0 1rem' }}>
              <AlertCircle size={16} strokeWidth={2.5} />
              <span>{kontrakError}</span>
            </div>
          )}

          <KontrakAdminTable
            kontrak={kontrakList}
            loading={kontrakLoading}
            onEdit={setEditingKontrak}
            onManageDocs={setDokumenKontrak}
            onDelete={setDeletingKontrak}
          />

          {kontrakTotalPages > 1 && (
            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Menampilkan {kontrakOffset + 1}–{Math.min(kontrakOffset + PAGE_SIZE, kontrakTotal)} dari {kontrakTotal} kontrak
              </span>
              <div className="admin-pagination-buttons">
                <button
                  className="btn admin-pagination-btn"
                  disabled={kontrakPage <= 1}
                  onClick={() => setKontrakPage((p) => p - 1)}
                >
                  Sebelumnya
                </button>
                <button
                  className="btn admin-pagination-btn"
                  disabled={kontrakPage >= kontrakTotalPages}
                  onClick={() => setKontrakPage((p) => p + 1)}
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- User Modals ---- */}
      <UserFormModal
        open={showCreateUserModal}
        user={null}
        onClose={() => { setShowCreateUserModal(false); setUserFormError(''); }}
        onSubmit={handleCreateUser}
        submitting={userFormSubmitting}
        externalError={userFormError}
      />

      <UserFormModal
        open={editingUser !== null}
        user={editingUser}
        onClose={() => { setEditingUser(null); setUserFormError(''); }}
        onSubmit={handleUpdateUser}
        submitting={userFormSubmitting}
        externalError={userFormError}
      />

      <DeleteConfirmModal
        open={deletingUser !== null}
        user={deletingUser}
        onClose={() => { setDeletingUser(null); setUserFormError(''); }}
        onConfirm={handleDeleteUser}
        deleting={userFormSubmitting}
        error={userFormError}
      />

      {/* ---- Kontrak Modals ---- */}
      <KontrakFormModal
        open={showCreateKontrakModal}
        kontrak={null}
        onClose={() => { setShowCreateKontrakModal(false); setKontrakFormError(''); }}
        onSubmit={handleCreateKontrak}
        submitting={kontrakFormSubmitting}
        externalError={kontrakFormError}
      />

      <KontrakFormModal
        open={editingKontrak !== null}
        kontrak={editingKontrak}
        onClose={() => { setEditingKontrak(null); setKontrakFormError(''); }}
        onSubmit={handleUpdateKontrak}
        submitting={kontrakFormSubmitting}
        externalError={kontrakFormError}
      />

      <DeleteConfirmModal
        open={deletingKontrak !== null}
        user={deletingKontrak ? { name: deletingKontrak.namaProyek, email: deletingKontrak.nomorKontrak } : null}
        onClose={() => { setDeletingKontrak(null); setKontrakFormError(''); }}
        onConfirm={handleDeleteKontrak}
        deleting={kontrakFormSubmitting}
        error={kontrakFormError}
      />

      <DokumenManager
        open={dokumenKontrak !== null}
        kontrak={dokumenKontrak}
        onClose={() => setDokumenKontrak(null)}
        onRefresh={handleDokumenRefresh}
        adminHook={adminKontrak}
      />
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/AdminDashboard.jsx
git commit -m "feat: add kontrak management section to AdminDashboard"
```

---

### Task 8: CSS Styles for Kontrak Admin

**Files:**
- Modify: `src/styles/components.css` (append at end of file)
- Modify: `src/styles/layouts.css` (add responsive rules)

- [ ] **Step 1: Append kontrak admin styles to components.css**

Open `src/styles/components.css`. Append the following CSS **after** the last rule (`.admin-select`):

```css

/* --- Kontrak Status Badge --- */
.kontrak-status-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.kontrak-status-badge--aktif {
  background-color: #dcfce7;
  color: #166534;
}

.kontrak-status-badge--selesai {
  background-color: #dbeafe;
  color: #1e40af;
}

.kontrak-status-badge--dalam-proses {
  background-color: #fef3c7;
  color: #92400e;
}

/* --- Dokumen Manager --- */
.dokumen-manager {
  max-width: 36rem;
  max-height: 90vh;
  overflow-y: auto;
}

.dokumen-manager-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dokumen-manager-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  box-shadow: var(--shadow-sm);
}

.dokumen-manager-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  color: var(--color-accent);
}

.dokumen-manager-item-icon svg {
  display: inline;
}

.dokumen-manager-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dokumen-manager-item-name {
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dokumen-manager-item-badges {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

/* --- Sumber Badge --- */
.sumber-badge {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: var(--radius-pill);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sumber-badge--lokal {
  background-color: var(--color-muted);
  color: var(--color-secondary);
}

.sumber-badge--appwrite {
  background-color: #dbeafe;
  color: #1e40af;
}

/* --- Dokumen Upload Form --- */
.dokumen-upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}

.dokumen-upload-heading {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

/* --- File Input Wrapper --- */
.file-input-wrapper {
  position: relative;
}

.file-input-wrapper input[type="file"] {
  font-size: 0.85rem;
  cursor: pointer;
}

.file-input-wrapper input[type="file"]::file-selector-button {
  padding: 0.5rem 1rem;
  margin-right: 0.75rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.8rem;
  background-color: var(--color-muted);
  color: var(--color-fg);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 150ms;
}

.file-input-wrapper input[type="file"]::file-selector-button:hover {
  background-color: var(--color-border);
}

/* --- Upload Success Message --- */
.upload-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #166534;
  background-color: #dcfce7;
  border-radius: var(--radius-sm);
}

.upload-success svg {
  flex-shrink: 0;
  display: inline;
}

/* --- User Dashboard --- */
.user-dashboard {
  min-height: 60vh;
}

.user-dashboard-header {
  margin-bottom: 2.5rem;
}

.user-dashboard-header h1 {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-bottom: 0.35rem;
}

.user-dashboard-welcome {
  color: var(--color-secondary);
  font-size: 1rem;
}

/* --- Dashboard Cards Grid --- */
.dashboard-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap);
}

.dashboard-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.75rem;
  text-decoration: none;
  color: var(--color-fg);
  cursor: pointer;
  position: relative;
}

.dashboard-card--disabled {
  opacity: 0.6;
  pointer-events: none;
  cursor: default;
}

.dashboard-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  box-shadow: var(--shadow-sm);
  color: var(--color-accent);
}

.dashboard-card-icon svg {
  display: inline;
}

.dashboard-card-title {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dashboard-card-desc {
  font-size: 0.9rem;
  color: var(--color-secondary);
  line-height: 1.5;
}

.dashboard-card-badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: var(--radius-pill);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background-color: #fef3c7;
  color: #92400e;
}

.dashboard-card-arrow {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 0.85rem;
  color: var(--color-accent);
  margin-top: auto;
}
```

- [ ] **Step 2: Add responsive rules to layouts.css**

Open `src/styles/layouts.css`.

**Inside the existing `@media (min-width: 768px)` block**, add after `.admin-table-name, .admin-table-email { max-width: none; }`:

```css

  .dokumen-manager {
    max-width: 36rem;
  }

  .dashboard-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/styles/components.css src/styles/layouts.css
git commit -m "feat: add CSS styles for kontrak admin, dokumen manager, user dashboard"
```

---

## Sub-Phase C2: Data Migration + User Dashboard

### Task 9: Migrate useKontrak Hooks

**Files:**
- Modify: `src/hooks/useKontrak.js`

- [ ] **Step 1: Update useKontrak.js**

Replace the entire contents of `src/hooks/useKontrak.js` with:

```javascript
import { useState, useEffect, useMemo } from 'react';
import { KONTRAK_DATA } from '../data/kontrak.js';
import { databases, storage } from '../lib/appwrite.js';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_KONTRAK = import.meta.env.VITE_APPWRITE_COLLECTION_KONTRAK;
const COL_DOKUMEN = import.meta.env.VITE_APPWRITE_COLLECTION_DOKUMEN;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_KONTRAK;

const APPWRITE_CONFIGURED = !!(DB_ID && COL_KONTRAK && COL_DOKUMEN);

if (import.meta.env.DEV && !APPWRITE_CONFIGURED) {
  console.warn(
    '[useKontrak] Appwrite Database env vars not set. Using static fallback data. ' +
    'Set VITE_APPWRITE_DATABASE_ID, VITE_APPWRITE_COLLECTION_KONTRAK, and VITE_APPWRITE_COLLECTION_DOKUMEN to enable.'
  );
}

function getFileUrl(fileId) {
  if (!BUCKET_ID || !fileId) return null;
  return storage.getFileView(BUCKET_ID, fileId);
}

function mapAppwriteDoc(kontrakDoc, dokumenDocs) {
  return {
    id: kontrakDoc.$id,
    nomorKontrak: kontrakDoc.nomorKontrak,
    namaProyek: kontrakDoc.namaProyek,
    tanggal: kontrakDoc.tanggal,
    status: kontrakDoc.status,
    dokumen: dokumenDocs.map((d) => ({
      id: d.$id,
      tipe: d.tipe,
      nama: d.nama,
      path: d.sumber === 'lokal' ? d.path : getFileUrl(d.fileId),
      sumber: d.sumber,
      ukuran: null,
    })),
  };
}

export function useKontrakList() {
  const [kontrakList, setKontrakList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!APPWRITE_CONFIGURED) {
      setKontrakList(KONTRAK_DATA);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchFromAppwrite() {
      try {
        const kontrakResult = await databases.listDocuments(DB_ID, COL_KONTRAK, [
          Query.orderDesc('$createdAt'),
          Query.limit(100),
        ]);

        const mapped = await Promise.all(
          kontrakResult.documents.map(async (k) => {
            const docsResult = await databases.listDocuments(DB_ID, COL_DOKUMEN, [
              Query.equal('kontrakId', k.$id),
              Query.limit(100),
            ]);
            return mapAppwriteDoc(k, docsResult.documents);
          })
        );

        if (!cancelled) {
          setKontrakList(mapped);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useKontrakList] Appwrite fetch failed, using static fallback:', err.message);
          setKontrakList(KONTRAK_DATA);
          setLoading(false);
        }
      }
    }

    fetchFromAppwrite();
    return () => { cancelled = true; };
  }, []);

  return { kontrakList, loading, error };
}

export function useKontrakById(id) {
  const [kontrak, setKontrak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setKontrak(null);
      setLoading(false);
      return;
    }

    if (!APPWRITE_CONFIGURED) {
      const found = KONTRAK_DATA.find((k) => k.id === id) ?? null;
      setKontrak(found);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchFromAppwrite() {
      try {
        const doc = await databases.getDocument(DB_ID, COL_KONTRAK, id);
        const docsResult = await databases.listDocuments(DB_ID, COL_DOKUMEN, [
          Query.equal('kontrakId', id),
          Query.limit(100),
        ]);
        if (!cancelled) {
          setKontrak(mapAppwriteDoc(doc, docsResult.documents));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useKontrakById] Appwrite fetch failed, trying static fallback:', err.message);
          const found = KONTRAK_DATA.find((k) => k.id === id) ?? null;
          setKontrak(found);
          setLoading(false);
        }
      }
    }

    fetchFromAppwrite();
    return () => { cancelled = true; };
  }, [id]);

  return { kontrak, loading, error };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useKontrak.js
git commit -m "feat: migrate useKontrak hooks to Appwrite DB with static fallback"
```

---

### Task 10: User Dashboard Page

**Files:**
- Create: `src/pages/UserDashboard.jsx`

- [ ] **Step 1: Create UserDashboard.jsx**

Create `src/pages/UserDashboard.jsx`:

```jsx
import { Link } from 'react-router-dom';
import { ClipboardList, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <section className="section user-dashboard">
      <div className="container">
        <div className="user-dashboard-header">
          <h1>Dashboard</h1>
          <p className="user-dashboard-welcome">
            Selamat datang, {user?.name || 'Pengguna'}
          </p>
        </div>

        <div className="dashboard-cards-grid">
          {/* Card 1: Inspeksi — Coming Soon */}
          <div className="card dashboard-card dashboard-card--disabled" aria-disabled="true">
            <div className="dashboard-card-icon">
              <ClipboardList size={24} strokeWidth={2} />
            </div>
            <h2 className="dashboard-card-title">
              Inspeksi CIVIL QTRACK
              <span className="dashboard-card-badge">Segera Hadir</span>
            </h2>
            <p className="dashboard-card-desc">
              Form inspeksi dan hasil pemeriksaan pekerjaan sipil secara digital.
            </p>
          </div>

          {/* Card 2: Dokumen Kontrak */}
          <Link to="/kontrak" className="card dashboard-card">
            <div className="dashboard-card-icon">
              <FileText size={24} strokeWidth={2} />
            </div>
            <h2 className="dashboard-card-title">Dokumen Kontrak</h2>
            <p className="dashboard-card-desc">
              Lihat daftar kontrak dan dokumen terkait seperti Approval Drawing dan BOQ.
            </p>
            <span className="dashboard-card-arrow">Buka →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/UserDashboard.jsx
git commit -m "feat: add UserDashboard page with navigation cards"
```

---

### Task 11: Update App.jsx — Wire UserDashboard

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Update App.jsx**

Read `src/App.jsx` first. Then:

1. Add import (after the `AdminDashboard` import):

```javascript
import UserDashboard from './pages/UserDashboard';
```

2. Replace the `/dashboard` route. Change:

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <UnderConstruction title="Dashboard" />
    </ProtectedRoute>
  }
/>
```

To:

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  }
/>
```

The full file should look like:

```jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
// DISABLED: Theme switcher floating button — uncomment to re-enable multi-theme support
// import ThemeSwitcher from './components/ThemeSwitcher';
import Home from './pages/Home';
import UnderConstruction from './components/UnderConstruction';
import KontrakPage from './pages/KontrakPage';
import KontrakDetailPage from './pages/KontrakDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function AppLayout() {
  const location = useLocation();

  return (
    <>
      <a href="#main-content" className="skip-nav">
        Langsung ke konten utama
      </a>
      <Navbar currentPath={location.pathname} />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/panduan" element={<UnderConstruction title="Panduan" />} />
          <Route path="/kontrak" element={<KontrakPage />} />
          <Route path="/kontrak/:id" element={<KontrakDetailPage />} />
          <Route path="/qna" element={<UnderConstruction title="Q & A" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <BottomNav currentPath={location.pathname} />
      {/* DISABLED: Theme switcher floating button — uncomment to re-enable */}
      {/* <ThemeSwitcher /> */}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire UserDashboard to /dashboard route"
```

---

### Task 12: CSS for User Dashboard (responsive)

**Files:** None additional needed — the user dashboard CSS was already included in Task 8 Step 1 (appended to `components.css`), and responsive rules were added in Task 8 Step 2 (`.dashboard-cards-grid` in `layouts.css`).

This task is a verification checkpoint.

- [ ] **Step 1: Verify dashboard CSS exists**

Confirm that `src/styles/components.css` contains `.user-dashboard`, `.dashboard-cards-grid`, `.dashboard-card`, `.dashboard-card-icon`, `.dashboard-card-title`, `.dashboard-card-desc`, `.dashboard-card-badge`, `.dashboard-card-arrow`.

Confirm that `src/styles/layouts.css` contains `.dashboard-cards-grid` inside the 768px media query.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

Expected: Build succeeds.

---

### Task 13: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run final build**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify file structure**

Run: `find functions/manage-kontrak/ src/hooks/useAdminKontrak.js src/hooks/useKontrak.js src/components/admin/KontrakAdminTable.jsx src/components/admin/KontrakFormModal.jsx src/components/admin/DokumenManager.jsx src/pages/UserDashboard.jsx src/pages/AdminDashboard.jsx -type f`

Expected files:
```
functions/manage-kontrak/package.json
functions/manage-kontrak/src/main.js
src/hooks/useAdminKontrak.js
src/hooks/useKontrak.js
src/components/admin/KontrakAdminTable.jsx
src/components/admin/KontrakFormModal.jsx
src/components/admin/DokumenManager.jsx
src/pages/UserDashboard.jsx
src/pages/AdminDashboard.jsx
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase C — Admin Kontrak Management + User Dashboard"
```

---

## Summary

| Task | Sub-Phase | What it does | Files |
|---|---|---|---|
| 1 | C1 | Cloud Function manage-kontrak | `functions/manage-kontrak/*` |
| 2 | C1 | Env vars + Databases/Storage SDK export | `.env.example`, `src/lib/appwrite.js` |
| 3 | C1 | useAdminKontrak hook | `src/hooks/useAdminKontrak.js` |
| 4 | C1 | KontrakAdminTable component | `src/components/admin/KontrakAdminTable.jsx` |
| 5 | C1 | KontrakFormModal component | `src/components/admin/KontrakFormModal.jsx` |
| 6 | C1 | DokumenManager component | `src/components/admin/DokumenManager.jsx` |
| 7 | C1 | AdminDashboard kontrak section | `src/pages/AdminDashboard.jsx` |
| 8 | C1 | CSS styles for kontrak admin + user dashboard | `src/styles/components.css`, `src/styles/layouts.css` |
| 9 | C2 | Migrate useKontrak to Appwrite DB | `src/hooks/useKontrak.js` |
| 10 | C2 | UserDashboard page | `src/pages/UserDashboard.jsx` |
| 11 | C2 | App.jsx route update | `src/App.jsx` |
| 12 | C2 | CSS verification checkpoint | — |
| 13 | — | Final verification | — |
