# Phase C: Admin Kontrak + User Dashboard — Design Spec

## Overview

Menambahkan fitur manajemen kontrak (CRUD) untuk admin dan dashboard untuk pegawai PLN di CIVIL QTRACK UPT Malang. Admin dapat mengelola data kontrak dan mengunggah dokumen PDF. Data kontrak bermigrasi dari static file ke Appwrite Database + Storage.

**Decomposition:**

| Sub-Phase | Scope | Dependency |
|---|---|---|
| **C1: Admin Kontrak Management** | Cloud Function manage-kontrak, Appwrite DB collections, Storage bucket, admin UI | B2 selesai |
| **C2: Data Migration + User Dashboard** | Migrasi hook useKontrak ke Appwrite, dashboard pegawai PLN | C1 selesai |

---

## Sub-Phase C1: Admin Kontrak Management

### Arsitektur

```
Frontend (Admin Dashboard)
  │
  ├── storage.createFile() ──→ Appwrite Storage (bucket: kontrak-documents)
  │                              ↑ Direct upload from browser
  │
  └── functions.createExecution() ──→ Cloud Function "manage-kontrak"
       │                                ├── Execute: label:admin
       │                                └── Uses: node-appwrite Server SDK
       │                                         ↓
       │                              Appwrite Database
       │                                ├── Collection: kontrak
       │                                └── Collection: dokumen
       │
Frontend (Public Kontrak Pages)
  └── databases.listDocuments() ──→ Appwrite Database (read: any)
       storage.getFileView()   ──→ Appwrite Storage (read: any)
```

### Appwrite Prerequisites (User Setup)

Sebelum kode berfungsi, user perlu setup di Appwrite Console:

#### 1. Database

Buat Database baru (atau gunakan existing):
- Database ID: bebas (catat untuk `.env`)

#### 2. Collection: `kontrak`

| Attribute | Type | Required | Keterangan |
|---|---|---|---|
| `nomorKontrak` | string (50) | Ya | Nomor kontrak unik |
| `namaProyek` | string (200) | Ya | Nama proyek |
| `tanggal` | string (30) | Ya | Tanggal ISO (yyyy-mm-dd) |
| `status` | string (20) | Ya | Nilai: aktif, selesai, dalam-proses |

**Permissions:** Read `any`, Create/Update/Delete `label:admin`

#### 3. Collection: `dokumen`

| Attribute | Type | Required | Keterangan |
|---|---|---|---|
| `kontrakId` | string (36) | Ya | Reference ke kontrak.$id |
| `tipe` | string (30) | Ya | approval-drawing, boq, lainnya |
| `nama` | string (200) | Ya | Nama dokumen tampil |
| `fileId` | string (36) | Tidak | Appwrite Storage file ID |
| `path` | string (500) | Tidak | Path lokal (legacy) |
| `sumber` | string (10) | Ya | 'lokal' atau 'appwrite' |

**Permissions:** Read `any`, Create/Update/Delete `label:admin`

#### 4. Storage Bucket: `kontrak-documents`

- Bucket ID: bebas (catat untuk `.env`)
- Allowed file extensions: `pdf`
- Max file size: 50MB
- **Permissions:** Read `any`, Create/Delete `label:admin`

#### 5. Environment Variables

Tambahan ke `.env` (dan `.env.example`):

```
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_COLLECTION_KONTRAK=your-kontrak-collection-id
VITE_APPWRITE_COLLECTION_DOKUMEN=your-dokumen-collection-id
VITE_APPWRITE_BUCKET_KONTRAK=your-bucket-id
VITE_APPWRITE_FUNCTION_MANAGE_KONTRAK=your-function-id
```

---

### Cloud Function: `manage-kontrak`

**Setup:** sama seperti manage-users — Runtime Node.js 18+, Execute `label:admin`, env var `APPWRITE_API_KEY`.

Tambahan env vars pada function (set di Appwrite Console):
- `APPWRITE_DATABASE_ID`
- `APPWRITE_COLLECTION_KONTRAK`
- `APPWRITE_COLLECTION_DOKUMEN`
- `APPWRITE_BUCKET_KONTRAK`

**Routes:**

| Method | Path | Action | Body |
|---|---|---|---|
| `GET` | `/kontrak` | List semua kontrak | — (query: search, limit, offset) |
| `POST` | `/kontrak` | Create kontrak | `{ nomorKontrak, namaProyek, tanggal, status }` |
| `PATCH` | `/kontrak/:id` | Update kontrak | `{ nomorKontrak?, namaProyek?, tanggal?, status? }` |
| `DELETE` | `/kontrak/:id` | Delete kontrak + semua dokumen terkait | — |
| `POST` | `/kontrak/:id/dokumen` | Add dokumen record ke kontrak | `{ tipe, nama, fileId, sumber }` |
| `DELETE` | `/dokumen/:id` | Delete satu dokumen record (+ Storage file jika appwrite) | — |

**Catatan:**
- File upload TIDAK melewati Cloud Function — frontend upload langsung ke Storage bucket
- Cloud Function hanya mengelola Database records
- Saat delete kontrak, function juga hapus semua dokumen terkait + file Storage

---

### File Baru (C1)

| File | Tanggung Jawab |
|---|---|
| `functions/manage-kontrak/package.json` | Dependencies |
| `functions/manage-kontrak/src/main.js` | Cloud Function entry point |
| `src/hooks/useAdminKontrak.js` | Hook untuk admin CRUD kontrak (via Cloud Function) |
| `src/components/admin/KontrakAdminTable.jsx` | Tabel daftar kontrak di admin |
| `src/components/admin/KontrakFormModal.jsx` | Modal create/edit kontrak |
| `src/components/admin/DokumenManager.jsx` | Komponen upload + list dokumen dalam kontrak |

### File yang Dimodifikasi (C1)

| File | Perubahan |
|---|---|
| `.env.example` | Tambah env vars Database, Collection, Bucket, Function |
| `src/lib/appwrite.js` | Tambah export `Databases`, `Storage` instances |
| `src/pages/AdminDashboard.jsx` | Tambah section "Manajemen Kontrak" di bawah user section |
| `src/styles/components.css` | Tambah CSS untuk kontrak admin table, dokumen manager |
| `src/styles/layouts.css` | Responsive rules tambahan |

---

### Detail Komponen C1

#### `src/hooks/useAdminKontrak.js`

Mirip `useUsers.js` — memanggil Cloud Function `manage-kontrak`.

**Methods:**
- `fetchKontrak(search?, limit?, offset?)` — GET /kontrak
- `createKontrak(data)` — POST /kontrak
- `updateKontrak(id, data)` — PATCH /kontrak/:id
- `deleteKontrak(id)` — DELETE /kontrak/:id
- `addDokumen(kontrakId, data)` — POST /kontrak/:id/dokumen
- `deleteDokumen(id)` — DELETE /dokumen/:id

Tambahan fungsi (langsung via Web SDK, bukan Cloud Function):
- `uploadFile(file)` — upload PDF ke Storage bucket, return fileId
- `deleteFile(fileId)` — hapus file dari Storage
- `getFileUrl(fileId)` — return URL untuk view/download

#### `src/components/admin/KontrakAdminTable.jsx`

**Columns:**
| Kolom | Field |
|---|---|
| No. Kontrak | `nomorKontrak` |
| Nama Proyek | `namaProyek` |
| Tanggal | `tanggal` |
| Status | badge |
| Dokumen | count |
| Aksi | Edit, Dokumen, Hapus |

#### `src/components/admin/KontrakFormModal.jsx`

**Form fields:**
| Field | Type | Required |
|---|---|---|
| Nomor Kontrak | text | Ya |
| Nama Proyek | text | Ya |
| Tanggal | date | Ya |
| Status | select (aktif/selesai/dalam-proses) | Ya |

#### `src/components/admin/DokumenManager.jsx`

**Tampilan:** Panel yang bisa dibuka dari tabel kontrak.

**Fitur:**
- List dokumen yang sudah ada (nama, tipe, tombol hapus)
- Form upload dokumen baru:
  - Input nama dokumen
  - Select tipe (approval-drawing, boq, lainnya)
  - File input (accept: .pdf)
  - Tombol "Upload"
- Progress indicator saat upload
- Dokumen lokal (sumber: 'lokal') ditandai badge "Lokal" dan tidak bisa dihapus via admin

---

## Sub-Phase C2: Data Migration + User Dashboard

### Migrasi useKontrak Hooks

`src/hooks/useKontrak.js` diperbarui:

**Logic:**
1. Check if Appwrite Database env vars tersedia
2. Jika ya → fetch dari Appwrite Database (collection kontrak + dokumen)
3. Jika tidak → fallback ke static `KONTRAK_DATA`
4. Return shape TETAP SAMA — `{ kontrakList, loading, error }` dan `{ kontrak, loading, error }`

**Mapping Appwrite → existing shape:**
```javascript
{
  id: doc.$id,
  nomorKontrak: doc.nomorKontrak,
  namaProyek: doc.namaProyek,
  tanggal: doc.tanggal,
  status: doc.status,
  dokumen: relatedDocs.map(d => ({
    id: d.$id,
    tipe: d.tipe,
    nama: d.nama,
    path: d.sumber === 'lokal' ? d.path : getFileUrl(d.fileId),
    sumber: d.sumber,
    ukuran: null,
  }))
}
```

**Impact pada public pages:** ZERO perubahan di `KontrakPage.jsx` dan `KontrakDetailPage.jsx` — hooks API identik.

### User Dashboard

`src/pages/UserDashboard.jsx` mengganti placeholder `UnderConstruction` di `/dashboard`.

**Layout:**
```
┌──────────────────────────────────────────┐
│ Dashboard                                │
│ Selamat datang, {user.name}              │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────────┐  ┌─────────────┐       │
│  │ 📋          │  │ 📄          │       │
│  │ Inspeksi    │  │ Kontrak     │       │
│  │ Form CIVIL  │  │ Lihat daftar│       │
│  │ QTRACK      │  │ kontrak     │       │
│  │ (Segera)    │  │             │       │
│  │             │  │ [Buka →]    │       │
│  └─────────────┘  └─────────────┘       │
│                                          │
└──────────────────────────────────────────┘
```

**Konten:**
- Heading: `Dashboard`
- Welcome: `Selamat datang, {user.name}`
- Card 1: "Inspeksi CIVIL QTRACK" — placeholder untuk Phase D, disabled/coming soon
- Card 2: "Dokumen Kontrak" — link ke `/kontrak`

**Styling:** Industrial Skeuomorphism, reuse card pattern.

### File Baru (C2)

| File | Tanggung Jawab |
|---|---|
| `src/pages/UserDashboard.jsx` | Dashboard pegawai PLN |

### File yang Dimodifikasi (C2)

| File | Perubahan |
|---|---|
| `src/hooks/useKontrak.js` | Migrasi ke Appwrite DB dengan fallback static |
| `src/lib/appwrite.js` | Sudah dimodifikasi di C1 |
| `src/App.jsx` | Ganti placeholder `/dashboard` dengan UserDashboard |
| `src/styles/components.css` | Tambah CSS user dashboard cards |

---

## Tidak Termasuk dalam Scope Phase C

- Form inspeksi "HASIL INSPEKSI CIVIL QTRACK" (Phase D)
- Notifikasi ke admin (Phase D)
- Import/seed data kontrak existing ke Appwrite (manual via Console)
- Bulk file upload
- File versioning
- Audit log perubahan kontrak
