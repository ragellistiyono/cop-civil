# Phase D: Form Inspeksi + Notifikasi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Multi-step inspection form wizard (Beton/Baja/Kayu), photo upload to Appwrite Storage, draft/submit workflow, inspection history list, and admin notifications.

**Tech Stack:** React 19, react-router-dom 7, appwrite (Web SDK — Client, Databases, Storage, Query, ID, Permission, Role), lucide-react, CSS custom properties (Industrial Skeuomorphism theme).

**Design Spec:** `docs/superpowers/specs/2025-04-15-phase-d-form-inspeksi-notifikasi-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `src/data/inspeksiSchema.js` | Static form field definitions — single source of truth for sections/fields |
| `src/hooks/useInspeksi.js` | Hook for inspeksi CRUD + photo upload via Web SDK |
| `src/hooks/useNotifikasi.js` | Hook for notifikasi read/create/mark-read via Web SDK |
| `src/components/inspeksi/InspeksiField.jsx` | Renders a single field by type (number, photo, select, textarea) |
| `src/components/inspeksi/PhotoUpload.jsx` | Photo upload with preview, progress, and delete |
| `src/components/inspeksi/StepProgress.jsx` | Step progress indicator (numbered circles + lines) |
| `src/components/inspeksi/StepInfoUmum.jsx` | Step 1: general info (date, location, kontrak, jenis pekerjaan) |
| `src/components/inspeksi/StepPekerjaan.jsx` | Step 2-N: accordion-based pekerjaan sections |
| `src/components/inspeksi/StepRingkasan.jsx` | Final step: read-only summary of all data |
| `src/pages/InspeksiFormPage.jsx` | Multi-step wizard page (new + edit draft) |
| `src/pages/InspeksiListPage.jsx` | List page (user history / admin all) |
| `src/pages/InspeksiDetailPage.jsx` | Read-only detail view |
| `src/components/admin/NotifikasiBadge.jsx` | Unread count badge on bell icon |
| `src/components/admin/NotifikasiPanel.jsx` | Dropdown panel listing notifications |

### Modified Files

| File | Change |
|---|---|
| `.env.example` | Add inspeksi + notifikasi env vars |
| `src/pages/UserDashboard.jsx` | Enable inspeksi card, add riwayat card |
| `src/pages/AdminDashboard.jsx` | Add notifikasi badge/panel + inspeksi table section |
| `src/App.jsx` | Add 6 new routes for inspeksi pages |
| `src/styles/components.css` | Append wizard, accordion, photo upload, notifikasi CSS |
| `src/styles/layouts.css` | Add responsive rules for inspeksi components |

---

## Task 1: inspeksiSchema.js — Form Field Definitions

**Files:**
- Create: `src/data/inspeksiSchema.js`

- [ ] **Step 1: Create inspeksiSchema.js**

Create `src/data/inspeksiSchema.js`:

```javascript
export const JENIS_PEKERJAAN = [
  { id: 'beton', label: 'Pekerjaan Beton' },
  { id: 'baja', label: 'Pekerjaan Baja' },
  { id: 'kayu', label: 'Pekerjaan Kayu' },
];

export const INSPEKSI_SCHEMA = {
  beton: {
    label: 'Pekerjaan Beton',
    sections: [
      {
        id: 'slumpTest',
        label: 'Slump Test',
        fields: [
          { id: 'suratJalan', label: 'Surat Jalan Mixer Truck (jika menggunakan beton ready mix)', type: 'photo' },
          { id: 'alatUji', label: 'Alat uji (kerucut, batang penusuk, alas)', type: 'photo' },
          { id: 'hasilPengukuran', label: 'Hasil Pengukuran Slump Test', type: 'number', unit: 'cm' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
      {
        id: 'penuanganBeton',
        label: 'Penuangan Beton (Placing)',
        fields: [
          { id: 'tinggiJatuh', label: 'Tinggi jatuh penuangan beton', type: 'number', unit: 'm' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
      {
        id: 'pemadatan',
        label: 'Pemadatan',
        fields: [
          { id: 'jumlahTitik', label: 'Jumlah titik pemadatan', type: 'number', unit: '' },
          { id: 'durasiTitik', label: 'Durasi pemadatan tiap titik', type: 'number', unit: 'detik' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
      {
        id: 'pengambilanSampel',
        label: 'Pengambilan Sampel',
        fields: [
          { id: 'jumlahSampel', label: 'Jumlah sampel', type: 'number', unit: '' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
      {
        id: 'curing',
        label: 'Curing',
        fields: [
          { id: 'jenisCuring', label: 'Jenis curing', type: 'select', options: ['penyiraman', 'genangan', 'terpal', 'curing compound'] },
          { id: 'durasiCuring', label: 'Durasi Curing', type: 'number', unit: 'hari' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
    ],
  },
  baja: {
    label: 'Pekerjaan Baja',
    sections: [
      {
        id: 'visualTesting',
        label: 'Visual Testing',
        fields: [
          { id: 'diameterTulangan', label: 'Diameter tulangan utama', type: 'number', unit: 'mm' },
          { id: 'jarakTulangan', label: 'Jarak tulangan', type: 'number', unit: 'cm' },
          { id: 'jarakSengkang', label: 'Jarak sengkang', type: 'number', unit: 'cm' },
          { id: 'kesesuaianGambar', label: 'Kesesuaian dengan gambar kerja', type: 'select', options: ['sesuai', 'tidak sesuai'] },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
      {
        id: 'torqueWrenchTest',
        label: 'Torque Wrench Test',
        fields: [
          { id: 'diameterBaut', label: 'Diameter baut', type: 'number', unit: 'mm' },
          { id: 'grade', label: 'Grade', type: 'number', unit: '' },
          { id: 'nilaiTorsi', label: 'Nilai torsi', type: 'number', unit: 'Nm' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
    ],
  },
  kayu: {
    label: 'Pekerjaan Kayu',
    sections: [
      {
        id: 'visualInspection',
        label: 'Visual Inspection',
        fields: [
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
    ],
  },
};

/**
 * Build an empty formData object for a given jenis pekerjaan.
 * Each field gets a default value based on its type.
 */
export function buildEmptyFormData(jenisIds) {
  const data = {};
  for (const jenisId of jenisIds) {
    const schema = INSPEKSI_SCHEMA[jenisId];
    if (!schema) continue;
    data[jenisId] = {};
    for (const section of schema.sections) {
      data[jenisId][section.id] = {};
      for (const field of section.fields) {
        if (field.type === 'photo') {
          data[jenisId][section.id][field.id] = { fileId: '' };
        } else if (field.type === 'number') {
          data[jenisId][section.id][field.id] = { value: '', unit: field.unit || '' };
        } else if (field.type === 'select') {
          data[jenisId][section.id][field.id] = '';
        } else {
          data[jenisId][section.id][field.id] = '';
        }
      }
    }
  }
  return data;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/inspeksiSchema.js
git commit -m "feat: add inspeksiSchema.js with form field definitions for Beton/Baja/Kayu"
```

---

## Task 2: useInspeksi Hook

**Files:**
- Create: `src/hooks/useInspeksi.js`

- [ ] **Step 1: Create useInspeksi.js**

Create `src/hooks/useInspeksi.js`:

```javascript
import { useState, useCallback } from 'react';
import { databases, storage, ID } from '../lib/appwrite.js';
import { Query, Permission, Role } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_INSPEKSI = import.meta.env.VITE_APPWRITE_COLLECTION_INSPEKSI;
const BUCKET_INSPEKSI = import.meta.env.VITE_APPWRITE_BUCKET_INSPEKSI;

if (import.meta.env.DEV && !DB_ID) {
  console.warn('[useInspeksi] VITE_APPWRITE_DATABASE_ID is not set.');
}
if (import.meta.env.DEV && !COL_INSPEKSI) {
  console.warn('[useInspeksi] VITE_APPWRITE_COLLECTION_INSPEKSI is not set.');
}
if (import.meta.env.DEV && !BUCKET_INSPEKSI) {
  console.warn('[useInspeksi] VITE_APPWRITE_BUCKET_INSPEKSI is not set.');
}

export function useInspeksi() {
  const [inspeksiList, setInspeksiList] = useState([]);
  const [total, setTotal] = useState(0);
  const [inspeksi, setInspeksi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInspeksiList = useCallback(async (userId = null, status = null, limit = 25, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset),
      ];
      if (userId) queries.push(Query.equal('userId', userId));
      if (status) queries.push(Query.equal('status', status));

      const result = await databases.listDocuments(DB_ID, COL_INSPEKSI, queries);
      setInspeksiList(result.documents);
      setTotal(result.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInspeksiById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await databases.getDocument(DB_ID, COL_INSPEKSI, id);
      setInspeksi(doc);
      return doc;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInspeksi = useCallback(async (data, userId) => {
    const doc = await databases.createDocument(
      DB_ID,
      COL_INSPEKSI,
      ID.unique(),
      {
        userId: data.userId,
        userName: data.userName,
        tanggalInspeksi: data.tanggalInspeksi,
        lokasi: data.lokasi,
        kontrakId: data.kontrakId || '',
        jenisPekerjaan: data.jenisPekerjaan.join(','),
        data: JSON.stringify(data.data),
        fotoIds: JSON.stringify(data.fotoIds || []),
        status: 'draft',
        submittedAt: '',
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.read(Role.label('admin')),
        Permission.delete(Role.label('admin')),
      ]
    );
    return doc;
  }, []);

  const updateInspeksi = useCallback(async (id, data) => {
    const updatePayload = {};
    if (data.tanggalInspeksi !== undefined) updatePayload.tanggalInspeksi = data.tanggalInspeksi;
    if (data.lokasi !== undefined) updatePayload.lokasi = data.lokasi;
    if (data.kontrakId !== undefined) updatePayload.kontrakId = data.kontrakId;
    if (data.jenisPekerjaan !== undefined) updatePayload.jenisPekerjaan = data.jenisPekerjaan.join(',');
    if (data.data !== undefined) updatePayload.data = JSON.stringify(data.data);
    if (data.fotoIds !== undefined) updatePayload.fotoIds = JSON.stringify(data.fotoIds);

    const doc = await databases.updateDocument(DB_ID, COL_INSPEKSI, id, updatePayload);
    return doc;
  }, []);

  const submitInspeksi = useCallback(async (id, data) => {
    const updatePayload = {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    if (data.tanggalInspeksi !== undefined) updatePayload.tanggalInspeksi = data.tanggalInspeksi;
    if (data.lokasi !== undefined) updatePayload.lokasi = data.lokasi;
    if (data.kontrakId !== undefined) updatePayload.kontrakId = data.kontrakId;
    if (data.jenisPekerjaan !== undefined) updatePayload.jenisPekerjaan = data.jenisPekerjaan.join(',');
    if (data.data !== undefined) updatePayload.data = JSON.stringify(data.data);
    if (data.fotoIds !== undefined) updatePayload.fotoIds = JSON.stringify(data.fotoIds);

    const doc = await databases.updateDocument(DB_ID, COL_INSPEKSI, id, updatePayload);
    return doc;
  }, []);

  const uploadPhoto = useCallback(async (file) => {
    const result = await storage.createFile(BUCKET_INSPEKSI, ID.unique(), file);
    return result.$id;
  }, []);

  const deletePhoto = useCallback(async (fileId) => {
    await storage.deleteFile(BUCKET_INSPEKSI, fileId);
  }, []);

  const getPhotoUrl = useCallback((fileId) => {
    if (!fileId) return null;
    return storage.getFileView(BUCKET_INSPEKSI, fileId);
  }, []);

  return {
    inspeksiList,
    total,
    inspeksi,
    loading,
    error,
    fetchInspeksiList,
    fetchInspeksiById,
    createInspeksi,
    updateInspeksi,
    submitInspeksi,
    uploadPhoto,
    deletePhoto,
    getPhotoUrl,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useInspeksi.js
git commit -m "feat: add useInspeksi hook for inspeksi CRUD + photo ops via Web SDK"
```

---

## Task 3: useNotifikasi Hook

**Files:**
- Create: `src/hooks/useNotifikasi.js`

- [ ] **Step 1: Create useNotifikasi.js**

Create `src/hooks/useNotifikasi.js`:

```javascript
import { useState, useCallback } from 'react';
import { databases, ID } from '../lib/appwrite.js';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_NOTIFIKASI = import.meta.env.VITE_APPWRITE_COLLECTION_NOTIFIKASI;

if (import.meta.env.DEV && !DB_ID) {
  console.warn('[useNotifikasi] VITE_APPWRITE_DATABASE_ID is not set.');
}
if (import.meta.env.DEV && !COL_NOTIFIKASI) {
  console.warn('[useNotifikasi] VITE_APPWRITE_COLLECTION_NOTIFIKASI is not set.');
}

export function useNotifikasi() {
  const [notifikasi, setNotifikasi] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifikasi = useCallback(async (limit = 20, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const result = await databases.listDocuments(DB_ID, COL_NOTIFIKASI, [
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset),
      ]);
      setNotifikasi(result.documents);
      return result.documents;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnreadCount = useCallback(async () => {
    try {
      const result = await databases.listDocuments(DB_ID, COL_NOTIFIKASI, [
        Query.equal('read', false),
        Query.limit(1),
      ]);
      setUnreadCount(result.total);
      return result.total;
    } catch (err) {
      console.warn('[useNotifikasi] Failed to get unread count:', err.message);
      return 0;
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await databases.updateDocument(DB_ID, COL_NOTIFIKASI, id, { read: true });
      setNotifikasi((prev) =>
        prev.map((n) => (n.$id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('[useNotifikasi] Failed to mark as read:', err.message);
    }
  }, []);

  const createNotifikasi = useCallback(async (data) => {
    const doc = await databases.createDocument(DB_ID, COL_NOTIFIKASI, ID.unique(), {
      type: data.type,
      message: data.message,
      referenceId: data.referenceId,
      userId: data.userId,
      userName: data.userName,
      read: false,
      createdAt: new Date().toISOString(),
    });
    return doc;
  }, []);

  return {
    notifikasi,
    unreadCount,
    loading,
    error,
    fetchNotifikasi,
    getUnreadCount,
    markAsRead,
    createNotifikasi,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useNotifikasi.js
git commit -m "feat: add useNotifikasi hook for admin notifications via Web SDK"
```

---

## Task 4: InspeksiField Component

**Files:**
- Create: `src/components/inspeksi/InspeksiField.jsx`

- [ ] **Step 1: Create InspeksiField.jsx**

Create `src/components/inspeksi/InspeksiField.jsx`:

```jsx
import PhotoUpload from './PhotoUpload';

export default function InspeksiField({ field, value, onChange, onPhotoUpload, onPhotoDelete, getPhotoUrl, disabled }) {
  const fieldId = `field-${field.id}-${Math.random().toString(36).slice(2, 8)}`;

  if (field.type === 'photo') {
    const fileId = value?.fileId || '';
    return (
      <div className="inspeksi-field">
        <label className="login-label">{field.label}</label>
        <PhotoUpload
          value={fileId}
          onChange={(newFileId) => onChange({ fileId: newFileId })}
          onUpload={onPhotoUpload}
          onDelete={onPhotoDelete}
          getUrl={getPhotoUrl}
          disabled={disabled}
        />
      </div>
    );
  }

  if (field.type === 'number') {
    const numValue = value?.value ?? '';
    return (
      <div className="inspeksi-field">
        <label htmlFor={fieldId} className="login-label">{field.label}</label>
        <div className="inspeksi-field-number-row">
          <input
            id={fieldId}
            type="number"
            className="login-input"
            value={numValue}
            onChange={(e) => onChange({ value: e.target.value, unit: field.unit || '' })}
            disabled={disabled}
            placeholder="0"
            step="any"
          />
          {field.unit && (
            <span className="inspeksi-field-unit">{field.unit}</span>
          )}
        </div>
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="inspeksi-field">
        <label htmlFor={fieldId} className="login-label">{field.label}</label>
        <select
          id={fieldId}
          className="login-input admin-select"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">— Pilih —</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="inspeksi-field">
        <label htmlFor={fieldId} className="login-label">{field.label}</label>
        <textarea
          id={fieldId}
          className="login-input inspeksi-textarea"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="Tulis catatan..."
        />
      </div>
    );
  }

  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/inspeksi/InspeksiField.jsx
git commit -m "feat: add InspeksiField component for rendering form fields by type"
```

---

## Task 5: PhotoUpload Component

**Files:**
- Create: `src/components/inspeksi/PhotoUpload.jsx`

- [ ] **Step 1: Create PhotoUpload.jsx**

Create `src/components/inspeksi/PhotoUpload.jsx`:

```jsx
import { useState, useRef } from 'react';
import { Upload, Trash2, Image, Loader } from 'lucide-react';

export default function PhotoUpload({ value, onChange, onUpload, onDelete, getUrl, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const hasPhoto = !!value;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const fileId = await onUpload(file);
      onChange(fileId);
    } catch (err) {
      console.warn('[PhotoUpload] Upload failed:', err.message);
      setPreview(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!value) return;
    setUploading(true);
    try {
      await onDelete(value);
      onChange('');
    } catch (err) {
      console.warn('[PhotoUpload] Delete failed:', err.message);
    } finally {
      setUploading(false);
    }
  };

  const imgSrc = preview || (hasPhoto ? getUrl(value) : null);

  if (hasPhoto || preview) {
    return (
      <div className="photo-upload photo-upload--has-photo">
        <div className="photo-upload-preview">
          <img src={imgSrc} alt="Preview foto" />
          {uploading && (
            <div className="photo-upload-overlay">
              <Loader size={24} className="spin" />
            </div>
          )}
        </div>
        {!disabled && !uploading && (
          <button
            type="button"
            className="btn photo-upload-delete"
            onClick={handleDelete}
            aria-label="Hapus foto"
          >
            <Trash2 size={16} strokeWidth={2} />
            <span>Hapus</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="photo-upload">
      <div className="photo-upload-placeholder">
        {uploading ? (
          <Loader size={24} className="spin" />
        ) : (
          <>
            <Image size={32} strokeWidth={1.5} />
            <span>Pilih foto</span>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="photo-upload-input"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        aria-label="Unggah foto"
      />
      {!disabled && !uploading && (
        <button
          type="button"
          className="btn photo-upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} strokeWidth={2} />
          <span>Unggah</span>
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/inspeksi/PhotoUpload.jsx
git commit -m "feat: add PhotoUpload component with preview, upload, and delete"
```

---

## Task 6: StepProgress Component

**Files:**
- Create: `src/components/inspeksi/StepProgress.jsx`

- [ ] **Step 1: Create StepProgress.jsx**

Create `src/components/inspeksi/StepProgress.jsx`:

```jsx
import { Check } from 'lucide-react';

export default function StepProgress({ steps, currentStep, onStepClick }) {
  return (
    <div className="step-progress" role="navigation" aria-label="Langkah form">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        let className = 'step-progress-item';
        if (isActive) className += ' step-progress-item--active';
        if (isCompleted) className += ' step-progress-item--completed';

        return (
          <div key={step.id} className={className}>
            {index > 0 && <div className="step-progress-line" />}
            <button
              type="button"
              className="step-progress-circle"
              onClick={() => onStepClick && isCompleted && onStepClick(index)}
              disabled={!isCompleted || !onStepClick}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Langkah ${index + 1}: ${step.label}`}
            >
              {isCompleted ? <Check size={14} strokeWidth={3} /> : index + 1}
            </button>
            <span className="step-progress-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/inspeksi/StepProgress.jsx
git commit -m "feat: add StepProgress component for wizard navigation"
```

---

## Task 7: StepInfoUmum Component

**Files:**
- Create: `src/components/inspeksi/StepInfoUmum.jsx`

- [ ] **Step 1: Create StepInfoUmum.jsx**

Create `src/components/inspeksi/StepInfoUmum.jsx`:

```jsx
import { JENIS_PEKERJAAN } from '../../data/inspeksiSchema.js';

export default function StepInfoUmum({ formData, onChange, kontrakList }) {
  const handleChange = (key, value) => {
    onChange({ ...formData, [key]: value });
  };

  const handleJenisToggle = (jenisId) => {
    const current = formData.jenisPekerjaan || [];
    const updated = current.includes(jenisId)
      ? current.filter((j) => j !== jenisId)
      : [...current, jenisId];
    handleChange('jenisPekerjaan', updated);
  };

  return (
    <div className="step-content">
      <h2 className="step-content-title">Informasi Umum</h2>

      <div className="login-field">
        <label htmlFor="tanggalInspeksi" className="login-label">Tanggal Inspeksi</label>
        <input
          id="tanggalInspeksi"
          type="date"
          className="login-input"
          value={formData.tanggalInspeksi || ''}
          onChange={(e) => handleChange('tanggalInspeksi', e.target.value)}
          required
        />
      </div>

      <div className="login-field">
        <label htmlFor="lokasi" className="login-label">Lokasi / Nama GI</label>
        <input
          id="lokasi"
          type="text"
          className="login-input"
          placeholder="Contoh: GI Pakis 150 kV"
          value={formData.lokasi || ''}
          onChange={(e) => handleChange('lokasi', e.target.value)}
          required
        />
      </div>

      <div className="login-field">
        <label htmlFor="kontrakId" className="login-label">Kontrak Terkait (Opsional)</label>
        <select
          id="kontrakId"
          className="login-input admin-select"
          value={formData.kontrakId || ''}
          onChange={(e) => handleChange('kontrakId', e.target.value)}
        >
          <option value="">— Tidak ada —</option>
          {(kontrakList || []).map((k) => (
            <option key={k.id || k.$id} value={k.id || k.$id}>
              {k.nomorKontrak} — {k.namaProyek}
            </option>
          ))}
        </select>
      </div>

      <div className="login-field">
        <span className="login-label">Pilih Jenis Pekerjaan (minimal 1)</span>
        <div className="inspeksi-checkbox-group">
          {JENIS_PEKERJAAN.map((jenis) => (
            <label key={jenis.id} className="inspeksi-checkbox-item">
              <input
                type="checkbox"
                checked={(formData.jenisPekerjaan || []).includes(jenis.id)}
                onChange={() => handleJenisToggle(jenis.id)}
              />
              <span>{jenis.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/inspeksi/StepInfoUmum.jsx
git commit -m "feat: add StepInfoUmum component for wizard step 1"
```

---

## Task 8: StepPekerjaan Component

**Files:**
- Create: `src/components/inspeksi/StepPekerjaan.jsx`

- [ ] **Step 1: Create StepPekerjaan.jsx**

Create `src/components/inspeksi/StepPekerjaan.jsx`:

```jsx
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { INSPEKSI_SCHEMA } from '../../data/inspeksiSchema.js';
import InspeksiField from './InspeksiField';

export default function StepPekerjaan({ jenisPekerjaanId, formData, onChange, onPhotoUpload, onPhotoDelete, getPhotoUrl, disabled }) {
  const schema = INSPEKSI_SCHEMA[jenisPekerjaanId];
  const [openSections, setOpenSections] = useState(() =>
    schema ? Object.fromEntries(schema.sections.map((s) => [s.id, true])) : {}
  );

  if (!schema) return null;

  const pekerjaanData = formData[jenisPekerjaanId] || {};

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleFieldChange = (sectionId, fieldId, value) => {
    const updatedSection = {
      ...(pekerjaanData[sectionId] || {}),
      [fieldId]: value,
    };
    const updatedPekerjaan = {
      ...pekerjaanData,
      [sectionId]: updatedSection,
    };
    onChange({
      ...formData,
      [jenisPekerjaanId]: updatedPekerjaan,
    });
  };

  return (
    <div className="step-content">
      <h2 className="step-content-title">{schema.label}</h2>

      {schema.sections.map((section) => {
        const isOpen = openSections[section.id] !== false;
        const sectionData = pekerjaanData[section.id] || {};

        return (
          <div key={section.id} className="inspeksi-section-accordion">
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleSection(section.id)}
              aria-expanded={isOpen}
            >
              <span>{section.label}</span>
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isOpen && (
              <div className="accordion-content">
                {section.fields.map((field) => (
                  <InspeksiField
                    key={field.id}
                    field={field}
                    value={sectionData[field.id]}
                    onChange={(val) => handleFieldChange(section.id, field.id, val)}
                    onPhotoUpload={onPhotoUpload}
                    onPhotoDelete={onPhotoDelete}
                    getPhotoUrl={getPhotoUrl}
                    disabled={disabled}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/inspeksi/StepPekerjaan.jsx
git commit -m "feat: add StepPekerjaan component with accordion sections"
```

---

## Task 9: StepRingkasan Component

**Files:**
- Create: `src/components/inspeksi/StepRingkasan.jsx`

- [ ] **Step 1: Create StepRingkasan.jsx**

Create `src/components/inspeksi/StepRingkasan.jsx`:

```jsx
import { INSPEKSI_SCHEMA } from '../../data/inspeksiSchema.js';

function RingkasanField({ field, value, getPhotoUrl }) {
  if (field.type === 'photo') {
    const fileId = value?.fileId;
    if (!fileId) return <span className="inspeksi-ringkasan-empty">(tidak diisi)</span>;
    const url = getPhotoUrl(fileId);
    return (
      <div className="inspeksi-ringkasan-photo">
        <img src={url} alt={field.label} />
      </div>
    );
  }

  if (field.type === 'number') {
    const numVal = value?.value;
    if (numVal === '' || numVal === undefined || numVal === null) {
      return <span className="inspeksi-ringkasan-empty">—</span>;
    }
    return (
      <span>
        {numVal} {value?.unit || field.unit || ''}
      </span>
    );
  }

  if (field.type === 'select') {
    if (!value) return <span className="inspeksi-ringkasan-empty">—</span>;
    return <span>{value}</span>;
  }

  if (field.type === 'textarea') {
    if (!value) return <span className="inspeksi-ringkasan-empty">(tidak diisi)</span>;
    return <span className="inspeksi-ringkasan-text">{value}</span>;
  }

  return null;
}

export default function StepRingkasan({ formData, getPhotoUrl }) {
  const jenisPekerjaan = formData.jenisPekerjaan || [];

  return (
    <div className="step-content inspeksi-ringkasan">
      <h2 className="step-content-title">Ringkasan Laporan</h2>

      <div className="inspeksi-ringkasan-section">
        <h3 className="inspeksi-ringkasan-heading">Informasi Umum</h3>
        <div className="inspeksi-ringkasan-grid">
          <div className="inspeksi-ringkasan-item">
            <span className="inspeksi-ringkasan-label">Tanggal Inspeksi</span>
            <span>{formData.tanggalInspeksi || '—'}</span>
          </div>
          <div className="inspeksi-ringkasan-item">
            <span className="inspeksi-ringkasan-label">Lokasi / Nama GI</span>
            <span>{formData.lokasi || '—'}</span>
          </div>
          <div className="inspeksi-ringkasan-item">
            <span className="inspeksi-ringkasan-label">Jenis Pekerjaan</span>
            <span>{jenisPekerjaan.map((j) => INSPEKSI_SCHEMA[j]?.label || j).join(', ') || '—'}</span>
          </div>
        </div>
      </div>

      {jenisPekerjaan.map((jenisId) => {
        const schema = INSPEKSI_SCHEMA[jenisId];
        if (!schema) return null;
        const pekerjaanData = formData[jenisId] || {};

        return (
          <div key={jenisId} className="inspeksi-ringkasan-section">
            <h3 className="inspeksi-ringkasan-heading">{schema.label}</h3>

            {schema.sections.map((section) => {
              const sectionData = pekerjaanData[section.id] || {};

              return (
                <div key={section.id} className="inspeksi-ringkasan-subsection">
                  <h4 className="inspeksi-ringkasan-subheading">{section.label}</h4>
                  <div className="inspeksi-ringkasan-grid">
                    {section.fields.map((field) => (
                      <div key={field.id} className="inspeksi-ringkasan-item">
                        <span className="inspeksi-ringkasan-label">{field.label}</span>
                        <RingkasanField
                          field={field}
                          value={sectionData[field.id]}
                          getPhotoUrl={getPhotoUrl}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/inspeksi/StepRingkasan.jsx
git commit -m "feat: add StepRingkasan component for read-only summary"
```

---

## Task 10: InspeksiFormPage

**Files:**
- Create: `src/pages/InspeksiFormPage.jsx`

- [ ] **Step 1: Create InspeksiFormPage.jsx**

Create `src/pages/InspeksiFormPage.jsx`:

```jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useInspeksi } from '../hooks/useInspeksi.js';
import { useNotifikasi } from '../hooks/useNotifikasi.js';
import { useKontrakList } from '../hooks/useKontrak.js';
import { INSPEKSI_SCHEMA, JENIS_PEKERJAAN, buildEmptyFormData } from '../data/inspeksiSchema.js';
import StepProgress from '../components/inspeksi/StepProgress';
import StepInfoUmum from '../components/inspeksi/StepInfoUmum';
import StepPekerjaan from '../components/inspeksi/StepPekerjaan';
import StepRingkasan from '../components/inspeksi/StepRingkasan';

export default function InspeksiFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    fetchInspeksiById, createInspeksi, updateInspeksi, submitInspeksi,
    uploadPhoto, deletePhoto, getPhotoUrl, loading: inspeksiLoading,
  } = useInspeksi();
  const { createNotifikasi } = useNotifikasi();
  const { kontrakList } = useKontrakList();

  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    tanggalInspeksi: '',
    lokasi: '',
    kontrakId: '',
    jenisPekerjaan: [],
    beton: {},
    baja: {},
    kayu: {},
  });
  const [fotoIds, setFotoIds] = useState([]);
  const [docId, setDocId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingDoc, setLoadingDoc] = useState(isEditMode);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;

    async function loadDraft() {
      setLoadingDoc(true);
      const doc = await fetchInspeksiById(id);
      if (cancelled || !doc) {
        setLoadingDoc(false);
        return;
      }
      if (doc.status !== 'draft') {
        navigate(`/inspeksi/${id}`, { replace: true });
        return;
      }

      const jenisPekerjaan = doc.jenisPekerjaan ? doc.jenisPekerjaan.split(',') : [];
      let parsedData = {};
      try { parsedData = JSON.parse(doc.data || '{}'); } catch { /* empty */ }
      let parsedFotoIds = [];
      try { parsedFotoIds = JSON.parse(doc.fotoIds || '[]'); } catch { /* empty */ }

      setFormData({
        tanggalInspeksi: doc.tanggalInspeksi || '',
        lokasi: doc.lokasi || '',
        kontrakId: doc.kontrakId || '',
        jenisPekerjaan,
        ...buildEmptyFormData(jenisPekerjaan),
        ...parsedData,
      });
      setFotoIds(parsedFotoIds);
      setDocId(doc.$id);
      setLoadingDoc(false);
    }

    loadDraft();
    return () => { cancelled = true; };
  }, [id, isEditMode, fetchInspeksiById, navigate]);

  const steps = useMemo(() => {
    const result = [{ id: 'info-umum', label: 'Info Umum' }];
    for (const jenisId of formData.jenisPekerjaan) {
      const schema = INSPEKSI_SCHEMA[jenisId];
      if (schema) result.push({ id: jenisId, label: schema.label });
    }
    result.push({ id: 'ringkasan', label: 'Ringkasan' });
    return result;
  }, [formData.jenisPekerjaan]);

  const handlePhotoUpload = useCallback(async (file) => {
    const fileId = await uploadPhoto(file);
    setFotoIds((prev) => [...prev, fileId]);
    return fileId;
  }, [uploadPhoto]);

  const handlePhotoDelete = useCallback(async (fileId) => {
    await deletePhoto(fileId);
    setFotoIds((prev) => prev.filter((fid) => fid !== fileId));
  }, [deletePhoto]);

  const validateStep = (stepIndex) => {
    const step = steps[stepIndex];
    if (!step) return true;

    if (step.id === 'info-umum') {
      if (!formData.tanggalInspeksi) return 'Tanggal inspeksi wajib diisi.';
      if (!formData.lokasi?.trim()) return 'Lokasi / Nama GI wajib diisi.';
      if (!formData.jenisPekerjaan || formData.jenisPekerjaan.length === 0) {
        return 'Pilih minimal 1 jenis pekerjaan.';
      }
    }
    return true;
  };

  const handleNext = () => {
    const result = validateStep(currentStep);
    if (result !== true) {
      setError(result);
      return;
    }
    setError('');

    if (steps[currentStep]?.id === 'info-umum') {
      const emptyData = buildEmptyFormData(formData.jenisPekerjaan);
      setFormData((prev) => {
        const merged = { ...prev };
        for (const jenisId of formData.jenisPekerjaan) {
          if (!merged[jenisId] || Object.keys(merged[jenisId]).length === 0) {
            merged[jenisId] = emptyData[jenisId] || {};
          }
        }
        return merged;
      });
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (index) => {
    setError('');
    setCurrentStep(index);
  };

  const buildPayload = () => ({
    userId: user?.$id,
    userName: user?.name || 'Unknown',
    tanggalInspeksi: formData.tanggalInspeksi,
    lokasi: formData.lokasi,
    kontrakId: formData.kontrakId,
    jenisPekerjaan: formData.jenisPekerjaan,
    data: (() => {
      const d = {};
      for (const jenisId of formData.jenisPekerjaan) {
        d[jenisId] = formData[jenisId] || {};
      }
      return d;
    })(),
    fotoIds,
  });

  const handleSaveDraft = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload();
      if (docId) {
        await updateInspeksi(docId, payload);
      } else {
        const doc = await createInspeksi(payload, user?.$id);
        setDocId(doc.$id);
        if (!isEditMode) {
          window.history.replaceState(null, '', `/inspeksi/${doc.$id}/edit`);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = buildPayload();
      let inspeksiId = docId;

      if (!inspeksiId) {
        const doc = await createInspeksi(payload, user?.$id);
        inspeksiId = doc.$id;
      }

      await submitInspeksi(inspeksiId, payload);

      await createNotifikasi({
        type: 'inspeksi_submitted',
        message: `${user?.name || 'User'} mengirim laporan inspeksi untuk ${formData.lokasi}`,
        referenceId: inspeksiId,
        userId: user?.$id,
        userName: user?.name || 'Unknown',
      });

      navigate(`/inspeksi/${inspeksiId}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (loadingDoc) {
    return (
      <section className="section">
        <div className="container">
          <div className="auth-loading">
            <div className="auth-loading-spinner" />
            <p>Memuat data inspeksi...</p>
          </div>
        </div>
      </section>
    );
  }

  const currentStepDef = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <section className="section inspeksi-wizard">
      <div className="container">
        <div className="inspeksi-wizard-header">
          <Link to="/inspeksi" className="kontrak-breadcrumb-link">
            <ChevronLeft size={16} /> Kembali ke Riwayat
          </Link>
          <h1>{isEditMode ? 'Edit Draft Inspeksi' : 'Laporan Inspeksi Baru'}</h1>
        </div>

        <StepProgress
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        <div className="inspeksi-wizard-body card">
          {currentStepDef?.id === 'info-umum' && (
            <StepInfoUmum
              formData={formData}
              onChange={setFormData}
              kontrakList={kontrakList}
            />
          )}

          {currentStepDef && currentStepDef.id !== 'info-umum' && currentStepDef.id !== 'ringkasan' && (
            <StepPekerjaan
              jenisPekerjaanId={currentStepDef.id}
              formData={formData}
              onChange={setFormData}
              onPhotoUpload={handlePhotoUpload}
              onPhotoDelete={handlePhotoDelete}
              getPhotoUrl={getPhotoUrl}
              disabled={false}
            />
          )}

          {currentStepDef?.id === 'ringkasan' && (
            <StepRingkasan formData={formData} getPhotoUrl={getPhotoUrl} />
          )}

          {error && (
            <div className="login-error" role="alert" style={{ marginTop: '1rem' }}>
              <AlertCircle size={16} strokeWidth={2.5} />
              <span>{error}</span>
            </div>
          )}

          <div className="step-navigation">
            <div className="step-navigation-left">
              {!isFirstStep && (
                <button type="button" className="btn btn-secondary" onClick={handlePrev}>
                  <ChevronLeft size={18} />
                  <span>Sebelumnya</span>
                </button>
              )}
            </div>

            <div className="step-navigation-right">
              <button
                type="button"
                className="btn"
                onClick={handleSaveDraft}
                disabled={saving || submitting}
              >
                <Save size={16} />
                <span>{saving ? 'Menyimpan...' : 'Simpan Draft'}</span>
              </button>

              {isLastStep ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowConfirm(true)}
                  disabled={saving || submitting}
                >
                  <Send size={16} />
                  <span>Kirim Laporan</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={saving || submitting}
                >
                  <span>Selanjutnya</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {showConfirm && (
          <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
            <div
              className="modal-content card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-submit-title"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === 'Escape' && setShowConfirm(false)}
            >
              <div className="modal-header">
                <h2 id="confirm-submit-title" className="modal-title">Kirim Laporan?</h2>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                  Setelah dikirim, laporan tidak dapat diedit lagi. Pastikan semua data sudah benar.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn modal-btn-cancel"
                  onClick={() => setShowConfirm(false)}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Mengirim...' : 'Ya, Kirim'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/InspeksiFormPage.jsx
git commit -m "feat: add InspeksiFormPage multi-step wizard with draft/submit workflow"
```

---

## Task 11: InspeksiListPage

**Files:**
- Create: `src/pages/InspeksiListPage.jsx`

- [ ] **Step 1: Create InspeksiListPage.jsx**

Create `src/pages/InspeksiListPage.jsx`:

```jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useInspeksi } from '../hooks/useInspeksi.js';
import { INSPEKSI_SCHEMA } from '../data/inspeksiSchema.js';

const PAGE_SIZE = 10;

function StatusBadge({ status }) {
  const modifier = status || 'draft';
  const labels = { draft: 'Draft', submitted: 'Terkirim' };
  return (
    <span className={`inspeksi-status-badge inspeksi-status-badge--${modifier}`}>
      {labels[status] || status}
    </span>
  );
}

function JenisTags({ jenisPekerjaan }) {
  if (!jenisPekerjaan) return null;
  const jenisIds = jenisPekerjaan.split(',').filter(Boolean);
  return (
    <div className="inspeksi-list-tags">
      {jenisIds.map((id) => (
        <span key={id} className="inspeksi-list-tag">
          {INSPEKSI_SCHEMA[id]?.label || id}
        </span>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function InspeksiListPage() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { inspeksiList, total, loading, error, fetchInspeksiList } = useInspeksi();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const refresh = useCallback(() => {
    const userId = isAdminRoute ? null : user?.$id;
    fetchInspeksiList(userId, null, PAGE_SIZE, offset);
  }, [fetchInspeksiList, isAdminRoute, user?.$id, offset]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCardClick = (inspeksiId) => {
    const basePath = isAdminRoute ? '/admin/inspeksi' : '/inspeksi';
    navigate(`${basePath}/${inspeksiId}`);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="inspeksi-list-header">
          <div>
            <h1>{isAdminRoute ? 'Semua Laporan Inspeksi' : 'Riwayat Inspeksi'}</h1>
            <p className="admin-subtitle">
              {isAdminRoute
                ? 'Daftar seluruh laporan inspeksi yang masuk'
                : 'Laporan inspeksi yang pernah Anda buat'}
            </p>
          </div>
          {!isAdminRoute && (
            <Link to="/inspeksi/baru" className="btn btn-primary">
              <Plus size={18} strokeWidth={2.5} />
              <span>Buat Laporan Baru</span>
            </Link>
          )}
        </div>

        {error && (
          <div className="login-error" role="alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} strokeWidth={2.5} />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="auth-loading">
            <div className="auth-loading-spinner" />
            <p>Memuat data...</p>
          </div>
        )}

        {!loading && inspeksiList.length === 0 && (
          <div className="kontrak-empty card">
            <h2>Belum ada laporan inspeksi</h2>
            {!isAdminRoute && (
              <Link to="/inspeksi/baru" className="btn btn-primary">
                Buat Laporan Pertama
              </Link>
            )}
          </div>
        )}

        {!loading && inspeksiList.length > 0 && (
          <div className="inspeksi-list">
            {inspeksiList.map((item) => (
              <button
                key={item.$id}
                type="button"
                className="card inspeksi-list-card"
                onClick={() => handleCardClick(item.$id)}
              >
                <div className="inspeksi-list-card-top">
                  <StatusBadge status={item.status} />
                  {isAdminRoute && (
                    <span className="inspeksi-list-card-user">{item.userName}</span>
                  )}
                </div>
                <h3 className="inspeksi-list-card-lokasi">{item.lokasi || 'Tanpa lokasi'}</h3>
                <div className="inspeksi-list-card-meta">
                  <span className="kontrak-meta-item">
                    <Calendar size={14} />
                    {formatDate(item.tanggalInspeksi)}
                  </span>
                  <span className="kontrak-meta-item">
                    <MapPin size={14} />
                    {item.lokasi || '-'}
                  </span>
                </div>
                <JenisTags jenisPekerjaan={item.jenisPekerjaan} />
              </button>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="admin-pagination">
            <span className="admin-pagination-info">
              Menampilkan {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} dari {total} laporan
            </span>
            <div className="admin-pagination-buttons">
              <button
                className="btn admin-pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </button>
              <button
                className="btn admin-pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/InspeksiListPage.jsx
git commit -m "feat: add InspeksiListPage for user history and admin list views"
```

---

## Task 12: InspeksiDetailPage

**Files:**
- Create: `src/pages/InspeksiDetailPage.jsx`

- [ ] **Step 1: Create InspeksiDetailPage.jsx**

Create `src/pages/InspeksiDetailPage.jsx`:

```jsx
import { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Pencil, MapPin, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useInspeksi } from '../hooks/useInspeksi.js';
import StepRingkasan from '../components/inspeksi/StepRingkasan';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const modifier = status || 'draft';
  const labels = { draft: 'Draft', submitted: 'Terkirim' };
  return (
    <span className={`inspeksi-status-badge inspeksi-status-badge--${modifier}`}>
      {labels[status] || status}
    </span>
  );
}

export default function InspeksiDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { inspeksi, loading, error, fetchInspeksiById, getPhotoUrl } = useInspeksi();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const backLink = isAdminRoute ? '/admin/inspeksi' : '/inspeksi';

  useEffect(() => {
    if (id) fetchInspeksiById(id);
  }, [id, fetchInspeksiById]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="auth-loading">
            <div className="auth-loading-spinner" />
            <p>Memuat detail inspeksi...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !inspeksi) {
    return (
      <section className="section">
        <div className="container">
          <div className="kontrak-empty card">
            <h2>{error || 'Inspeksi tidak ditemukan'}</h2>
            <Link to={backLink} className="btn btn-secondary">Kembali</Link>
          </div>
        </div>
      </section>
    );
  }

  const jenisPekerjaan = inspeksi.jenisPekerjaan ? inspeksi.jenisPekerjaan.split(',') : [];
  let parsedData = {};
  try { parsedData = JSON.parse(inspeksi.data || '{}'); } catch { /* empty */ }

  const formData = {
    tanggalInspeksi: inspeksi.tanggalInspeksi,
    lokasi: inspeksi.lokasi,
    kontrakId: inspeksi.kontrakId,
    jenisPekerjaan,
    ...parsedData,
  };

  const isOwner = user?.$id === inspeksi.userId;
  const isDraft = inspeksi.status === 'draft';

  return (
    <section className="section">
      <div className="container">
        <div className="kontrak-breadcrumb">
          <Link to={backLink} className="kontrak-breadcrumb-link">
            <ChevronLeft size={16} /> {isAdminRoute ? 'Semua Inspeksi' : 'Riwayat Inspeksi'}
          </Link>
        </div>

        <div className="card inspeksi-detail-header">
          <div className="inspeksi-detail-header-info">
            <div className="inspeksi-detail-header-top">
              <StatusBadge status={inspeksi.status} />
              {isDraft && isOwner && !isAdminRoute && (
                <Link to={`/inspeksi/${id}/edit`} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>
                  <Pencil size={16} />
                  <span>Lanjutkan Edit</span>
                </Link>
              )}
            </div>

            <h1 className="kontrak-detail-title">{inspeksi.lokasi || 'Tanpa lokasi'}</h1>

            <div className="inspeksi-detail-meta">
              <span className="kontrak-meta-item">
                <Calendar size={16} />
                {formatDate(inspeksi.tanggalInspeksi)}
              </span>
              <span className="kontrak-meta-item">
                <MapPin size={16} />
                {inspeksi.lokasi}
              </span>
              <span className="kontrak-meta-item">
                <User size={16} />
                {inspeksi.userName}
              </span>
            </div>

            {inspeksi.submittedAt && (
              <p className="inspeksi-detail-submitted">
                Dikirim pada {formatDate(inspeksi.submittedAt)}
              </p>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <StepRingkasan formData={formData} getPhotoUrl={getPhotoUrl} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/InspeksiDetailPage.jsx
git commit -m "feat: add InspeksiDetailPage for read-only detail view"
```

---

## Task 13: NotifikasiBadge + NotifikasiPanel

**Files:**
- Create: `src/components/admin/NotifikasiBadge.jsx`
- Create: `src/components/admin/NotifikasiPanel.jsx`

- [ ] **Step 1: Create NotifikasiBadge.jsx**

Create `src/components/admin/NotifikasiBadge.jsx`:

```jsx
import { Bell } from 'lucide-react';

export default function NotifikasiBadge({ count, onClick }) {
  return (
    <button
      type="button"
      className="admin-action-btn notifikasi-bell-btn"
      onClick={onClick}
      aria-label={`Notifikasi${count > 0 ? ` (${count} belum dibaca)` : ''}`}
    >
      <Bell size={20} strokeWidth={2} />
      {count > 0 && (
        <span className="notifikasi-badge">{count > 99 ? '99+' : count}</span>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Create NotifikasiPanel.jsx**

Create `src/components/admin/NotifikasiPanel.jsx`:

```jsx
import { useEffect, useRef } from 'react';
import { X, ClipboardList, CheckCircle } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}

export default function NotifikasiPanel({ open, onClose, notifikasi, onRead, onNavigate }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="notifikasi-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Panel Notifikasi"
    >
      <div className="notifikasi-panel-header">
        <h3 className="notifikasi-panel-title">Notifikasi</h3>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup">
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="notifikasi-panel-body">
        {(!notifikasi || notifikasi.length === 0) && (
          <p className="notifikasi-panel-empty">Tidak ada notifikasi.</p>
        )}

        {notifikasi?.map((n) => (
          <button
            key={n.$id}
            type="button"
            className={`notifikasi-item${n.read ? '' : ' notifikasi-item--unread'}`}
            onClick={() => {
              onRead(n.$id);
              onNavigate(n.referenceId);
            }}
          >
            <div className="notifikasi-item-icon">
              {n.read
                ? <CheckCircle size={18} strokeWidth={2} />
                : <ClipboardList size={18} strokeWidth={2} />}
            </div>
            <div className="notifikasi-item-content">
              <span className="notifikasi-item-message">{n.message}</span>
              <span className="notifikasi-item-time">{timeAgo(n.createdAt || n.$createdAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/NotifikasiBadge.jsx src/components/admin/NotifikasiPanel.jsx
git commit -m "feat: add NotifikasiBadge and NotifikasiPanel for admin notifications"
```

---

## Task 14: Update AdminDashboard — Notifikasi + Inspeksi Section

**Files:**
- Modify: `src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Update AdminDashboard.jsx**

Read `src/pages/AdminDashboard.jsx` first. Then apply the following changes:

1. Add new imports after the existing imports:

```javascript
import { Bell, Eye } from 'lucide-react';
import { useNotifikasi } from '../hooks/useNotifikasi.js';
import { useInspeksi } from '../hooks/useInspeksi.js';
import NotifikasiBadge from '../components/admin/NotifikasiBadge';
import NotifikasiPanel from '../components/admin/NotifikasiPanel';
import { useNavigate } from 'react-router-dom';
```

2. Inside the `AdminDashboard` component, after the kontrak management state section, add the notifikasi + inspeksi state block:

```javascript
  /* ---- Notifikasi State ---- */
  const navigate = useNavigate();
  const { notifikasi: notifList, unreadCount, fetchNotifikasi, getUnreadCount, markAsRead } = useNotifikasi();
  const { inspeksiList: recentInspeksi, fetchInspeksiList: fetchRecentInspeksi } = useInspeksi();
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    getUnreadCount();
    fetchNotifikasi(15);
    fetchRecentInspeksi(null, 'submitted', 10, 0);
  }, [getUnreadCount, fetchNotifikasi, fetchRecentInspeksi]);

  const handleNotifNavigate = (referenceId) => {
    setNotifOpen(false);
    navigate(`/admin/inspeksi/${referenceId}`);
  };
```

3. In the JSX, add the notifikasi bell button in the admin header. Change the `admin-header` div:

From:
```jsx
        <div className="admin-header">
          <h1>Dashboard Admin</h1>
          <p className="admin-subtitle">Manajemen Sistem CIVIL QTRACK UPT Malang</p>
        </div>
```

To:
```jsx
        <div className="admin-header">
          <div>
            <h1>Dashboard Admin</h1>
            <p className="admin-subtitle">Manajemen Sistem CIVIL QTRACK UPT Malang</p>
          </div>
          <div className="admin-header-actions">
            <NotifikasiBadge count={unreadCount} onClick={() => setNotifOpen((p) => !p)} />
            <NotifikasiPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifikasi={notifList}
              onRead={markAsRead}
              onNavigate={handleNotifNavigate}
            />
          </div>
        </div>
```

4. After the Kontrak Management section `</div>` and before the closing `</div>` of `container`, add the Inspeksi section:

```jsx
        {/* ---- Laporan Inspeksi Section ---- */}
        <div className="admin-section card" style={{ marginTop: '2rem' }}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Laporan Inspeksi Terbaru</h2>
            <Link to="/admin/inspeksi" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              Lihat Semua
            </Link>
          </div>

          {recentInspeksi.length === 0 ? (
            <div className="admin-table-empty">
              <p>Belum ada laporan inspeksi.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Lokasi</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInspeksi.map((item) => (
                    <tr key={item.$id}>
                      <td className="admin-table-date">
                        {item.tanggalInspeksi
                          ? new Date(item.tanggalInspeksi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="admin-table-name">{item.lokasi || '-'}</td>
                      <td>{item.userName || '-'}</td>
                      <td>
                        <span className={`inspeksi-status-badge inspeksi-status-badge--${item.status}`}>
                          {item.status === 'submitted' ? 'Terkirim' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/admin/inspeksi/${item.$id}`}
                          className="admin-action-btn"
                          aria-label={`Lihat inspeksi ${item.lokasi}`}
                        >
                          <Eye size={16} strokeWidth={2} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
```

5. Also add `Link` to the existing imports from `react-router-dom`:

```javascript
import { Link } from 'react-router-dom';
```

**Full updated AdminDashboard.jsx:**

Replace the entire contents of `src/pages/AdminDashboard.jsx` with:

```jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UserPlus, Plus, AlertCircle, Eye } from 'lucide-react';
import { useUsers } from '../hooks/useUsers.js';
import { useAdminKontrak } from '../hooks/useAdminKontrak.js';
import { useNotifikasi } from '../hooks/useNotifikasi.js';
import { useInspeksi } from '../hooks/useInspeksi.js';
import UserTable from '../components/admin/UserTable';
import UserFormModal from '../components/admin/UserFormModal';
import DeleteConfirmModal from '../components/admin/DeleteConfirmModal';
import KontrakAdminTable from '../components/admin/KontrakAdminTable';
import KontrakFormModal from '../components/admin/KontrakFormModal';
import DokumenManager from '../components/admin/DokumenManager';
import NotifikasiBadge from '../components/admin/NotifikasiBadge';
import NotifikasiPanel from '../components/admin/NotifikasiPanel';

const PAGE_SIZE = 10;

export default function AdminDashboard() {
  const navigate = useNavigate();

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
  };

  useEffect(() => {
    if (dokumenKontrak) {
      const updated = kontrakList.find((k) => k.$id === dokumenKontrak.$id);
      if (updated) setDokumenKontrak(updated);
    }
  }, [kontrakList, dokumenKontrak]);

  /* ---- Notifikasi + Inspeksi State ---- */
  const { notifikasi: notifList, unreadCount, fetchNotifikasi, getUnreadCount, markAsRead } = useNotifikasi();
  const { inspeksiList: recentInspeksi, fetchInspeksiList: fetchRecentInspeksi } = useInspeksi();
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    getUnreadCount();
    fetchNotifikasi(15);
    fetchRecentInspeksi(null, 'submitted', 10, 0);
  }, [getUnreadCount, fetchNotifikasi, fetchRecentInspeksi]);

  const handleNotifNavigate = (referenceId) => {
    setNotifOpen(false);
    navigate(`/admin/inspeksi/${referenceId}`);
  };

  return (
    <section className="section admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Dashboard Admin</h1>
            <p className="admin-subtitle">Manajemen Sistem CIVIL QTRACK UPT Malang</p>
          </div>
          <div className="admin-header-actions">
            <NotifikasiBadge count={unreadCount} onClick={() => setNotifOpen((p) => !p)} />
            <NotifikasiPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifikasi={notifList}
              onRead={markAsRead}
              onNavigate={handleNotifNavigate}
            />
          </div>
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
                <button className="btn admin-pagination-btn" disabled={userPage <= 1} onClick={() => setUserPage((p) => p - 1)}>Sebelumnya</button>
                <button className="btn admin-pagination-btn" disabled={userPage >= userTotalPages} onClick={() => setUserPage((p) => p + 1)}>Berikutnya</button>
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
                <button className="btn admin-pagination-btn" disabled={kontrakPage <= 1} onClick={() => setKontrakPage((p) => p - 1)}>Sebelumnya</button>
                <button className="btn admin-pagination-btn" disabled={kontrakPage >= kontrakTotalPages} onClick={() => setKontrakPage((p) => p + 1)}>Berikutnya</button>
              </div>
            </div>
          )}
        </div>

        {/* ---- Laporan Inspeksi Section ---- */}
        <div className="admin-section card" style={{ marginTop: '2rem' }}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Laporan Inspeksi Terbaru</h2>
            <Link to="/admin/inspeksi" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              Lihat Semua
            </Link>
          </div>

          {recentInspeksi.length === 0 ? (
            <div className="admin-table-empty">
              <p>Belum ada laporan inspeksi.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Lokasi</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInspeksi.map((item) => (
                    <tr key={item.$id}>
                      <td className="admin-table-date">
                        {item.tanggalInspeksi
                          ? new Date(item.tanggalInspeksi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="admin-table-name">{item.lokasi || '-'}</td>
                      <td>{item.userName || '-'}</td>
                      <td>
                        <span className={`inspeksi-status-badge inspeksi-status-badge--${item.status}`}>
                          {item.status === 'submitted' ? 'Terkirim' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/inspeksi/${item.$id}`} className="admin-action-btn" aria-label={`Lihat inspeksi ${item.lokasi}`}>
                          <Eye size={16} strokeWidth={2} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        title="Hapus Kontrak"
        message={deletingKontrak ? (
          <>Apakah Anda yakin ingin menghapus kontrak <strong>{deletingKontrak.namaProyek}</strong> ({deletingKontrak.nomorKontrak})? Semua dokumen terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.</>
        ) : undefined}
        confirmLabel="Hapus Kontrak"
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
git commit -m "feat: add notifikasi badge/panel + inspeksi table to AdminDashboard"
```

---

## Task 15: Update UserDashboard — Enable Inspeksi Card

**Files:**
- Modify: `src/pages/UserDashboard.jsx`

- [ ] **Step 1: Update UserDashboard.jsx**

Replace the entire contents of `src/pages/UserDashboard.jsx` with:

```jsx
import { Link } from 'react-router-dom';
import { ClipboardList, FileText, History } from 'lucide-react';
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
          {/* Card 1: Inspeksi — Active */}
          <Link to="/inspeksi/baru" className="card dashboard-card">
            <div className="dashboard-card-icon">
              <ClipboardList size={24} strokeWidth={2} />
            </div>
            <h2 className="dashboard-card-title">Inspeksi CIVIL QTRACK</h2>
            <p className="dashboard-card-desc">
              Form inspeksi dan hasil pemeriksaan pekerjaan sipil secara digital.
            </p>
            <span className="dashboard-card-arrow">Buka →</span>
          </Link>

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

          {/* Card 3: Riwayat Inspeksi */}
          <Link to="/inspeksi" className="card dashboard-card">
            <div className="dashboard-card-icon">
              <History size={24} strokeWidth={2} />
            </div>
            <h2 className="dashboard-card-title">Riwayat Inspeksi</h2>
            <p className="dashboard-card-desc">
              Lihat semua laporan inspeksi yang pernah Anda buat, termasuk draft dan yang sudah dikirim.
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
git commit -m "feat: enable inspeksi card + add riwayat card to UserDashboard"
```

---

## Task 16: Update App.jsx — Routes

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Update App.jsx**

Read `src/App.jsx` first. Then:

1. Add new imports after the existing page imports:

```javascript
import InspeksiFormPage from './pages/InspeksiFormPage';
import InspeksiListPage from './pages/InspeksiListPage';
import InspeksiDetailPage from './pages/InspeksiDetailPage';
```

2. Add new routes inside the `<Routes>` block. Add them after the `/admin/dashboard` route and before the closing `</Routes>`:

```jsx
          {/* ---- Inspeksi Routes (User) ---- */}
          <Route
            path="/inspeksi"
            element={
              <ProtectedRoute>
                <InspeksiListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspeksi/baru"
            element={
              <ProtectedRoute>
                <InspeksiFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspeksi/:id"
            element={
              <ProtectedRoute>
                <InspeksiDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspeksi/:id/edit"
            element={
              <ProtectedRoute>
                <InspeksiFormPage />
              </ProtectedRoute>
            }
          />
          {/* ---- Inspeksi Routes (Admin) ---- */}
          <Route
            path="/admin/inspeksi"
            element={
              <ProtectedRoute adminOnly>
                <InspeksiListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inspeksi/:id"
            element={
              <ProtectedRoute adminOnly>
                <InspeksiDetailPage />
              </ProtectedRoute>
            }
          />
```

**Full updated App.jsx:**

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
import InspeksiFormPage from './pages/InspeksiFormPage';
import InspeksiListPage from './pages/InspeksiListPage';
import InspeksiDetailPage from './pages/InspeksiDetailPage';

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
          {/* ---- Inspeksi Routes (User) ---- */}
          <Route
            path="/inspeksi"
            element={
              <ProtectedRoute>
                <InspeksiListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspeksi/baru"
            element={
              <ProtectedRoute>
                <InspeksiFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspeksi/:id"
            element={
              <ProtectedRoute>
                <InspeksiDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspeksi/:id/edit"
            element={
              <ProtectedRoute>
                <InspeksiFormPage />
              </ProtectedRoute>
            }
          />
          {/* ---- Inspeksi Routes (Admin) ---- */}
          <Route
            path="/admin/inspeksi"
            element={
              <ProtectedRoute adminOnly>
                <InspeksiListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inspeksi/:id"
            element={
              <ProtectedRoute adminOnly>
                <InspeksiDetailPage />
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

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add inspeksi routes (user + admin) to App.jsx"
```

---

## Task 17: Update .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Update .env.example**

Append to `.env.example` (after the existing `VITE_APPWRITE_FUNCTION_MANAGE_KONTRAK` line):

```
VITE_APPWRITE_COLLECTION_INSPEKSI=your-inspeksi-collection-id
VITE_APPWRITE_COLLECTION_NOTIFIKASI=your-notifikasi-collection-id
VITE_APPWRITE_BUCKET_INSPEKSI=your-inspeksi-bucket-id
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
VITE_APPWRITE_COLLECTION_INSPEKSI=your-inspeksi-collection-id
VITE_APPWRITE_COLLECTION_NOTIFIKASI=your-notifikasi-collection-id
VITE_APPWRITE_BUCKET_INSPEKSI=your-inspeksi-bucket-id
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "feat: add inspeksi + notifikasi env vars to .env.example"
```

---

## Task 18: CSS Styles

**Files:**
- Modify: `src/styles/components.css` (append at end of file)
- Modify: `src/styles/layouts.css` (add responsive rules)

- [ ] **Step 1: Append inspeksi styles to components.css**

Open `src/styles/components.css`. Append the following CSS **after** the last rule (`.dashboard-card-arrow`):

```css

/* --- Inspeksi Wizard --- */
.inspeksi-wizard-header {
  margin-bottom: 2rem;
}

.inspeksi-wizard-header h1 {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-top: 0.75rem;
}

.inspeksi-wizard-body {
  padding: 2rem;
}

.inspeksi-wizard-body:hover {
  transform: none;
  box-shadow: var(--shadow-md);
}

/* --- Step Progress --- */
.step-progress {
  display: flex;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.step-progress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  position: relative;
  min-width: 5rem;
}

.step-progress-line {
  position: absolute;
  top: 1rem;
  right: 50%;
  width: 100%;
  height: 2px;
  background-color: var(--color-border);
  z-index: 0;
}

.step-progress-item--completed .step-progress-line {
  background-color: var(--color-accent);
}

.step-progress-item--active .step-progress-line {
  background-color: var(--color-accent);
}

.step-progress-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-circle);
  background-color: var(--color-muted);
  color: var(--color-secondary);
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 0.8rem;
  border: none;
  cursor: default;
  z-index: 1;
  transition: all var(--transition-speed) var(--transition-easing);
}

.step-progress-item--active .step-progress-circle {
  background-color: var(--color-accent);
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.step-progress-item--completed .step-progress-circle {
  background-color: var(--color-accent);
  color: var(--color-white);
  cursor: pointer;
}

.step-progress-item--completed .step-progress-circle:hover {
  box-shadow: var(--shadow-md);
}

.step-progress-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-align: center;
  color: var(--color-secondary);
  max-width: 6rem;
  line-height: 1.3;
}

.step-progress-item--active .step-progress-label {
  color: var(--color-fg);
}

/* --- Step Content --- */
.step-content {
  margin-bottom: 1.5rem;
}

.step-content-title {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

/* --- Step Navigation --- */
.step-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.step-navigation-left,
.step-navigation-right {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* --- Inspeksi Section Accordion --- */
.inspeksi-section-accordion {
  margin-bottom: 1rem;
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1rem;
  color: var(--color-fg);
  transition: background-color 150ms;
}

.accordion-header:hover {
  background-color: var(--color-muted);
}

.accordion-header svg {
  display: inline;
  color: var(--color-secondary);
  flex-shrink: 0;
}

.accordion-content {
  padding: 0 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* --- Inspeksi Field --- */
.inspeksi-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.inspeksi-field-number-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.inspeksi-field-number-row .login-input {
  flex: 1;
}

.inspeksi-field-unit {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-secondary);
  white-space: nowrap;
  min-width: 2.5rem;
}

.inspeksi-textarea {
  resize: vertical;
  min-height: 4rem;
}

/* --- Photo Upload --- */
.photo-upload {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.photo-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  box-shadow: var(--shadow-recessed);
  color: var(--color-secondary);
  cursor: pointer;
}

.photo-upload-placeholder svg {
  display: inline;
}

.photo-upload-placeholder span {
  font-size: 0.8rem;
  font-weight: 500;
}

.photo-upload-input {
  display: none;
}

.photo-upload-btn {
  font-size: 0.8rem;
  padding: 0.45rem 0.9rem;
  align-self: flex-start;
}

.photo-upload-preview {
  position: relative;
  width: 100%;
  max-width: 16rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.photo-upload-preview img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 12rem;
}

.photo-upload-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
  color: var(--color-white);
}

.photo-upload-delete {
  font-size: 0.8rem;
  padding: 0.45rem 0.9rem;
  align-self: flex-start;
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.photo-upload-delete:hover {
  background-color: var(--color-danger);
  color: var(--color-white);
}

/* --- Inspeksi Ringkasan --- */
.inspeksi-ringkasan-section {
  margin-bottom: 2rem;
}

.inspeksi-ringkasan-heading {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-accent);
}

.inspeksi-ringkasan-subheading {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  color: var(--color-secondary);
}

.inspeksi-ringkasan-subsection {
  margin-bottom: 1.5rem;
}

.inspeksi-ringkasan-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.inspeksi-ringkasan-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
}

.inspeksi-ringkasan-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.inspeksi-ringkasan-empty {
  color: var(--color-secondary);
  font-style: italic;
  font-size: 0.85rem;
}

.inspeksi-ringkasan-text {
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.inspeksi-ringkasan-photo {
  width: 100%;
  max-width: 12rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.inspeksi-ringkasan-photo img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 8rem;
}

/* --- Inspeksi List --- */
.inspeksi-list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.inspeksi-list-header h1 {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-bottom: 0.25rem;
}

.inspeksi-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap);
}

.inspeksi-list-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
  cursor: pointer;
  background: none;
  border: none;
  font-family: var(--font-body);
  width: 100%;
  color: var(--color-fg);
}

.inspeksi-list-card-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.inspeksi-list-card-user {
  font-size: 0.8rem;
  color: var(--color-secondary);
}

.inspeksi-list-card-lokasi {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.1rem;
}

.inspeksi-list-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.inspeksi-list-tags {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.inspeksi-list-tag {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-pill);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  background-color: var(--color-muted);
  color: var(--color-secondary);
}

/* --- Inspeksi Status Badge --- */
.inspeksi-status-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.inspeksi-status-badge--draft {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.inspeksi-status-badge--submitted {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

/* --- Inspeksi Checkbox Group --- */
.inspeksi-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.inspeksi-checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-size: 0.95rem;
}

.inspeksi-checkbox-item input[type="checkbox"] {
  width: 1.15rem;
  height: 1.15rem;
  accent-color: var(--color-accent);
  cursor: pointer;
}

/* --- Inspeksi Detail Header --- */
.inspeksi-detail-header {
  padding: 2rem;
}

.inspeksi-detail-header:hover {
  transform: none;
  box-shadow: var(--shadow-md);
}

.inspeksi-detail-header-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.inspeksi-detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.75rem;
}

.inspeksi-detail-submitted {
  font-size: 0.85rem;
  color: var(--color-secondary);
  margin-top: 0.5rem;
}

/* --- Notifikasi Badge --- */
.notifikasi-bell-btn {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
}

.notifikasi-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.3rem;
  border-radius: var(--radius-circle);
  background-color: var(--color-danger);
  color: var(--color-white);
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 1;
}

/* --- Notifikasi Panel --- */
.notifikasi-panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 22rem;
  max-height: 28rem;
  background-color: var(--color-card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  display: flex;
  flex-direction: column;
  animation: slideUp 200ms ease-out;
}

.notifikasi-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.notifikasi-panel-title {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1rem;
}

.notifikasi-panel-body {
  overflow-y: auto;
  flex: 1;
}

.notifikasi-panel-empty {
  padding: 2rem 1.25rem;
  text-align: center;
  color: var(--color-secondary);
  font-size: 0.85rem;
}

.notifikasi-item {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  font-family: var(--font-body);
  text-align: left;
  color: var(--color-fg);
  transition: background-color 150ms;
}

.notifikasi-item:hover {
  background-color: var(--color-muted);
}

.notifikasi-item--unread {
  background-color: var(--color-info-bg);
}

.notifikasi-item--unread:hover {
  background-color: var(--color-muted);
}

.notifikasi-item-icon {
  display: flex;
  align-items: flex-start;
  padding-top: 0.1rem;
  color: var(--color-accent);
  flex-shrink: 0;
}

.notifikasi-item-icon svg {
  display: inline;
}

.notifikasi-item-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.notifikasi-item-message {
  font-size: 0.85rem;
  line-height: 1.4;
}

.notifikasi-item-time {
  font-size: 0.7rem;
  color: var(--color-secondary);
}

/* --- Admin Header Actions (notifikasi positioning) --- */
.admin-header-actions {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

- [ ] **Step 2: Add responsive rules to layouts.css**

Open `src/styles/layouts.css`.

**Inside the existing `@media (min-width: 768px)` block**, add after `.dashboard-cards-grid { grid-template-columns: repeat(2, 1fr); }`:

```css

  .inspeksi-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .inspeksi-wizard-body {
    padding: 2.5rem;
  }

  .inspeksi-ringkasan-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .step-progress {
    overflow-x: visible;
  }

  .dashboard-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
```

**Inside the existing `@media (min-width: 1024px)` block**, add after `.admin-section { padding: 2.5rem; }`:

```css

  .inspeksi-list {
    grid-template-columns: repeat(3, 1fr);
  }
```

**Note:** The 768px breakpoint already has `.dashboard-cards-grid { grid-template-columns: repeat(2, 1fr); }`. Change this to `repeat(3, 1fr)` since we now have 3 cards. Alternatively, keep 2-col at 768px and add 3-col at 1024px. Use the approach above: override at 768px to 3-col (since there are exactly 3 cards, it fits well).

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/styles/components.css src/styles/layouts.css
git commit -m "feat: add CSS styles for inspeksi wizard, photo upload, notifikasi panel"
```

---

## Task 19: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run final build**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify file structure**

Run: `find src/data/inspeksiSchema.js src/hooks/useInspeksi.js src/hooks/useNotifikasi.js src/components/inspeksi/ src/components/admin/NotifikasiBadge.jsx src/components/admin/NotifikasiPanel.jsx src/pages/InspeksiFormPage.jsx src/pages/InspeksiListPage.jsx src/pages/InspeksiDetailPage.jsx -type f`

Expected files:
```
src/data/inspeksiSchema.js
src/hooks/useInspeksi.js
src/hooks/useNotifikasi.js
src/components/inspeksi/InspeksiField.jsx
src/components/inspeksi/PhotoUpload.jsx
src/components/inspeksi/StepProgress.jsx
src/components/inspeksi/StepInfoUmum.jsx
src/components/inspeksi/StepPekerjaan.jsx
src/components/inspeksi/StepRingkasan.jsx
src/components/admin/NotifikasiBadge.jsx
src/components/admin/NotifikasiPanel.jsx
src/pages/InspeksiFormPage.jsx
src/pages/InspeksiListPage.jsx
src/pages/InspeksiDetailPage.jsx
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase D — Form Inspeksi + Notifikasi"
```

---

## Summary

| Task | What it does | Files |
|---|---|---|
| 1 | Form schema definitions (Beton/Baja/Kayu) | `src/data/inspeksiSchema.js` |
| 2 | useInspeksi hook — CRUD + photo ops via Web SDK | `src/hooks/useInspeksi.js` |
| 3 | useNotifikasi hook — notification CRUD via Web SDK | `src/hooks/useNotifikasi.js` |
| 4 | InspeksiField — renders field by type | `src/components/inspeksi/InspeksiField.jsx` |
| 5 | PhotoUpload — upload/preview/delete photo | `src/components/inspeksi/PhotoUpload.jsx` |
| 6 | StepProgress — wizard step indicator | `src/components/inspeksi/StepProgress.jsx` |
| 7 | StepInfoUmum — general info step | `src/components/inspeksi/StepInfoUmum.jsx` |
| 8 | StepPekerjaan — accordion sections per pekerjaan | `src/components/inspeksi/StepPekerjaan.jsx` |
| 9 | StepRingkasan — read-only summary | `src/components/inspeksi/StepRingkasan.jsx` |
| 10 | InspeksiFormPage — multi-step wizard orchestrator | `src/pages/InspeksiFormPage.jsx` |
| 11 | InspeksiListPage — list/history view | `src/pages/InspeksiListPage.jsx` |
| 12 | InspeksiDetailPage — read-only detail view | `src/pages/InspeksiDetailPage.jsx` |
| 13 | NotifikasiBadge + NotifikasiPanel | `src/components/admin/NotifikasiBadge.jsx`, `NotifikasiPanel.jsx` |
| 14 | AdminDashboard — notifikasi + inspeksi section | `src/pages/AdminDashboard.jsx` |
| 15 | UserDashboard — enable inspeksi cards | `src/pages/UserDashboard.jsx` |
| 16 | App.jsx — 6 new routes | `src/App.jsx` |
| 17 | .env.example — 3 new env vars | `.env.example` |
| 18 | CSS styles for all new components | `src/styles/components.css`, `src/styles/layouts.css` |
| 19 | Final verification + commit | — |
