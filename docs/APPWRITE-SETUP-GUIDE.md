# Panduan Setup Appwrite Cloud Console — CIVIL QTRACK UPT Malang

Dokumen ini berisi langkah-langkah lengkap untuk setup Appwrite Cloud Console dari Phase B1 sampai Phase D. Ikuti secara berurutan.

> **Project Info:**
> - Endpoint: `https://sgp.cloud.appwrite.io/v1`
> - Project ID: `civilqtrack`

---

## Daftar Isi

1. [Phase B1: Auth Setup](#phase-b1-auth-setup)
2. [Phase B2: Cloud Function — manage-users](#phase-b2-cloud-function--manage-users)
3. [Phase C: Database + Storage + Cloud Function — manage-kontrak](#phase-c-database--storage--cloud-function--manage-kontrak)
4. [Phase D: Collections + Storage — Inspeksi & Notifikasi](#phase-d-collections--storage--inspeksi--notifikasi)
5. [Update File .env](#update-file-env)
6. [Verifikasi](#verifikasi)

---

## Phase B1: Auth Setup

> ✅ **Sudah selesai** — buat akun admin pertama via Appwrite Console.

### Yang sudah dilakukan:
1. Buat project `civilqtrack` di Appwrite Console
2. Buat user admin pertama via **Auth → Create User**
3. Tambahkan label `admin` ke user tersebut via **Auth → [User] → Labels → tambah `admin`**
4. Tambah platform Web di **Overview → Integrations → Add platform → Web**:
   - Name: `CIVIL QTRACK`
   - Hostname: `localhost` (untuk development)

---

## Phase B2: Cloud Function — manage-users

### Langkah 1: Buat API Key

1. Buka **Overview → Integrations → API keys → Create API key**
2. Name: `server-functions`
3. Expiration: `Never`
4. Scopes — centang:
   - `users.read`
   - `users.write`
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `documents.read`
   - `documents.write`
   - `files.read`
   - `files.write`
   - `buckets.read`
   - `buckets.write`
5. Klik **Create**
6. **SALIN dan simpan API Key Secret** — tidak bisa dilihat lagi setelah menutup dialog

### Langkah 2: Buat Cloud Function manage-users

1. Buka **Functions → Create function → Manual**
2. Isi form:

| Field | Nilai |
|---|---|
| **Name** | `manage-users` |
| **Function ID** | `manage-users` |
| **Runtime** | `Node.js - 18.0` |
| **Entrypoint** | `src/main.js` |

3. Di bagian **Execute access**:
   - Klik **+ Add role**
   - Pilih `label:admin`

4. Klik **Create**

### Langkah 3: Set Environment Variables pada Function

1. Setelah function dibuat, buka function → **Settings → Environment variables**
2. Tambahkan:

| Key | Value |
|---|---|
| `APPWRITE_API_KEY` | *(API Key Secret dari Langkah 1)* |

3. Klik **Update**

### Langkah 4: Deploy Code

1. Buka function → **Deployments → Create deployment → Manual**
2. Pilih metode **Upload file** (tar.gz)
3. Di terminal lokal, buat tar.gz dari folder function:

```bash
cd functions/manage-users
tar -czf /tmp/manage-users.tar.gz .
```

4. Upload file `/tmp/manage-users.tar.gz`
5. Centang **Activate deployment after build**
6. Klik **Create**
7. Tunggu status berubah menjadi **Ready** (biasanya 1-2 menit)

### Langkah 5: Catat Function ID

Function ID: `manage-users` → masukkan ke `.env`:

```
VITE_APPWRITE_FUNCTION_MANAGE_USERS=manage-users
```

---

## Phase C: Database + Storage + Cloud Function — manage-kontrak

### Langkah 1: Buat Database

1. Buka **Databases → Create database**
2. Name: `civilqtrack-db`
3. Database ID: `civilqtrack-db` (atau biarkan auto-generate)
4. Klik **Create**
5. **Catat Database ID** untuk `.env`

### Langkah 2: Buat Collection — kontrak

1. Di dalam database → **Create collection**
2. Name: `kontrak`
3. Collection ID: `kontrak` (atau biarkan auto-generate)
4. Klik **Create**

#### 2a. Tambah Attributes

Buka collection → **Attributes → Create attribute**:

| Attribute Key | Type | Size | Required | Default |
|---|---|---|---|---|
| `nomorKontrak` | String | 50 | ✅ Ya | — |
| `namaProyek` | String | 200 | ✅ Ya | — |
| `tanggal` | String | 30 | ✅ Ya | — |
| `status` | String | 20 | ✅ Ya | — |

#### 2b. Set Permissions

Buka collection → **Settings → Permissions**:

| Role | Read | Create | Update | Delete |
|---|---|---|---|---|
| `Any` | ✅ | ❌ | ❌ | ❌ |
| `label:admin` | ✅ | ✅ | ✅ | ✅ |

Klik **Update**

### Langkah 3: Buat Collection — dokumen

1. Di dalam database → **Create collection**
2. Name: `dokumen`
3. Collection ID: `dokumen` (atau biarkan auto-generate)
4. Klik **Create**

#### 3a. Tambah Attributes

| Attribute Key | Type | Size | Required | Default |
|---|---|---|---|---|
| `kontrakId` | String | 36 | ✅ Ya | — |
| `tipe` | String | 30 | ✅ Ya | — |
| `nama` | String | 200 | ✅ Ya | — |
| `fileId` | String | 36 | ❌ Tidak | — |
| `path` | String | 500 | ❌ Tidak | — |
| `sumber` | String | 10 | ✅ Ya | — |

#### 3b. Set Permissions

Sama dengan collection `kontrak`:

| Role | Read | Create | Update | Delete |
|---|---|---|---|---|
| `Any` | ✅ | ❌ | ❌ | ❌ |
| `label:admin` | ✅ | ✅ | ✅ | ✅ |

### Langkah 4: Buat Storage Bucket — kontrak-documents

1. Buka **Storage → Create bucket**
2. Name: `kontrak-documents`
3. Bucket ID: `kontrak-documents` (atau biarkan auto-generate)
4. Klik **Create**

#### 4a. Set Bucket Settings

Buka bucket → **Settings**:

| Setting | Nilai |
|---|---|
| **Maximum file size** | `50000000` (50 MB) |
| **Allowed file extensions** | `pdf` |
| **Encryption** | Enabled (default) |
| **Antivirus** | Enabled (default) |

#### 4b. Set Bucket Permissions

| Role | Read | Create | Update | Delete |
|---|---|---|---|---|
| `Any` | ✅ | ❌ | ❌ | ❌ |
| `label:admin` | ✅ | ✅ | ✅ | ✅ |

Klik **Update**

### Langkah 5: Buat Cloud Function — manage-kontrak

1. Buka **Functions → Create function → Manual**
2. Isi form:

| Field | Nilai |
|---|---|
| **Name** | `manage-kontrak` |
| **Function ID** | `manage-kontrak` |
| **Runtime** | `Node.js - 18.0` |
| **Entrypoint** | `src/main.js` |

3. **Execute access**: tambah role `label:admin`
4. Klik **Create**

#### 5a. Set Environment Variables

Buka function → **Settings → Environment variables**:

| Key | Value |
|---|---|
| `APPWRITE_API_KEY` | *(API Key Secret yang sama dari Phase B2)* |
| `APPWRITE_DATABASE_ID` | *(Database ID dari Langkah 1)* |
| `APPWRITE_COLLECTION_KONTRAK` | *(Collection ID kontrak dari Langkah 2)* |
| `APPWRITE_COLLECTION_DOKUMEN` | *(Collection ID dokumen dari Langkah 3)* |
| `APPWRITE_BUCKET_KONTRAK` | *(Bucket ID dari Langkah 4)* |

Klik **Update**

#### 5b. Deploy Code

```bash
cd functions/manage-kontrak
tar -czf /tmp/manage-kontrak.tar.gz .
```

Upload `/tmp/manage-kontrak.tar.gz` seperti langkah deploy manage-users.

### Langkah 6: Catat Semua ID

```
VITE_APPWRITE_DATABASE_ID=<database-id>
VITE_APPWRITE_COLLECTION_KONTRAK=<kontrak-collection-id>
VITE_APPWRITE_COLLECTION_DOKUMEN=<dokumen-collection-id>
VITE_APPWRITE_BUCKET_KONTRAK=<kontrak-documents-bucket-id>
VITE_APPWRITE_FUNCTION_MANAGE_KONTRAK=manage-kontrak
```

---

## Phase D: Collections + Storage — Inspeksi & Notifikasi

### Langkah 1: Buat Collection — inspeksi

1. Di dalam database `civilqtrack-db` → **Create collection**
2. Name: `inspeksi`
3. Collection ID: `inspeksi` (atau biarkan auto-generate)
4. Klik **Create**

#### 1a. Tambah Attributes

| Attribute Key | Type | Size | Required | Default |
|---|---|---|---|---|
| `userId` | String | 36 | ✅ Ya | — |
| `userName` | String | 100 | ✅ Ya | — |
| `tanggalInspeksi` | String | 30 | ✅ Ya | — |
| `lokasi` | String | 200 | ✅ Ya | — |
| `kontrakId` | String | 36 | ❌ Tidak | — |
| `jenisPekerjaan` | String | 100 | ✅ Ya | — |
| `data` | String | **1000000** | ✅ Ya | — |
| `fotoIds` | String | 10000 | ✅ Ya | — |
| `status` | String | 20 | ✅ Ya | — |
| `submittedAt` | String | 30 | ❌ Tidak | — |

> **⚠️ Penting:** Attribute `data` harus berukuran **1.000.000 karakter** (1 juta) karena menyimpan seluruh form inspeksi sebagai JSON string.

#### 1b. Aktifkan Document Security

Buka collection → **Settings → Document security** → **Enable**

Ini diperlukan agar setiap inspeksi hanya bisa diedit oleh pemiliknya. Permission spesifik per dokumen di-set saat create dari kode.

#### 1c. Set Collection Permissions

| Role | Read | Create | Update | Delete |
|---|---|---|---|---|
| `Users` | ✅ | ✅ | ❌ | ❌ |
| `label:admin` | ✅ | ❌ | ❌ | ✅ |

> **Catatan:** Update tidak di-set di collection level karena menggunakan document-level permissions (yang di-set otomatis oleh kode saat create). Hanya pemilik dokumen yang bisa update draft-nya.

### Langkah 2: Buat Collection — notifikasi

1. Di dalam database → **Create collection**
2. Name: `notifikasi`
3. Collection ID: `notifikasi` (atau biarkan auto-generate)
4. Klik **Create**

#### 2a. Tambah Attributes

| Attribute Key | Type | Size | Required | Default |
|---|---|---|---|---|
| `type` | String | 30 | ✅ Ya | — |
| `message` | String | 500 | ✅ Ya | — |
| `referenceId` | String | 36 | ✅ Ya | — |
| `userId` | String | 36 | ✅ Ya | — |
| `userName` | String | 100 | ✅ Ya | — |
| `read` | **Boolean** | — | ✅ Ya | `false` |
| `createdAt` | String | 30 | ✅ Ya | — |

> **⚠️ Penting:** `read` bertipe **Boolean**, bukan String!

#### 2b. Aktifkan Document Security

Buka collection → **Settings → Document security** → **Enable**

#### 2c. Set Collection Permissions

| Role | Read | Create | Update | Delete |
|---|---|---|---|---|
| `label:admin` | ✅ | ❌ | ✅ | ✅ |
| `Users` | ❌ | ✅ | ❌ | ❌ |

> **Catatan:** User hanya bisa membuat notifikasi (Create). Hanya admin yang bisa membaca dan menandai sebagai sudah dibaca (Update). Kode juga set document-level permission `read(label:admin)` dan `update(label:admin)` saat create.

### Langkah 3: Buat Storage Bucket — inspeksi-photos

1. Buka **Storage → Create bucket**
2. Name: `inspeksi-photos`
3. Bucket ID: `inspeksi-photos` (atau biarkan auto-generate)
4. Klik **Create**

#### 3a. Set Bucket Settings

| Setting | Nilai |
|---|---|
| **Maximum file size** | `10000000` (10 MB) |
| **Allowed file extensions** | `jpg`, `jpeg`, `png`, `webp` |

#### 3b. Set Bucket Permissions

| Role | Read | Create | Update | Delete |
|---|---|---|---|---|
| `Users` | ✅ | ✅ | ❌ | ❌ |
| `label:admin` | ✅ | ❌ | ❌ | ✅ |

### Langkah 4: Catat Semua ID

```
VITE_APPWRITE_COLLECTION_INSPEKSI=<inspeksi-collection-id>
VITE_APPWRITE_COLLECTION_NOTIFIKASI=<notifikasi-collection-id>
VITE_APPWRITE_BUCKET_INSPEKSI=<inspeksi-photos-bucket-id>
```

---

## Update File .env

Setelah semua setup selesai, update file `.env` di root project dengan semua ID yang telah dicatat:

```env
# Appwrite Core
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=civilqtrack

# Phase B2: Cloud Function manage-users
VITE_APPWRITE_FUNCTION_MANAGE_USERS=manage-users

# Phase C: Database + Storage + Cloud Function manage-kontrak
VITE_APPWRITE_DATABASE_ID=<database-id>
VITE_APPWRITE_COLLECTION_KONTRAK=<kontrak-collection-id>
VITE_APPWRITE_COLLECTION_DOKUMEN=<dokumen-collection-id>
VITE_APPWRITE_BUCKET_KONTRAK=<kontrak-documents-bucket-id>
VITE_APPWRITE_FUNCTION_MANAGE_KONTRAK=manage-kontrak

# Phase D: Inspeksi + Notifikasi
VITE_APPWRITE_COLLECTION_INSPEKSI=<inspeksi-collection-id>
VITE_APPWRITE_COLLECTION_NOTIFIKASI=<notifikasi-collection-id>
VITE_APPWRITE_BUCKET_INSPEKSI=<inspeksi-photos-bucket-id>
```

Ganti semua `<...>` dengan ID yang sebenarnya dari Appwrite Console.

---

## Verifikasi

### Cek 1: Auth

```bash
npm run dev
```

1. Buka `http://localhost:5173/login`
2. Login dengan akun admin yang sudah dibuat
3. Harus redirect ke `/admin/dashboard`

### Cek 2: Cloud Function manage-users

1. Di admin dashboard → section "Manajemen User"
2. Klik "Tambah User" → isi form → Submit
3. User baru harus muncul di tabel

### Cek 3: Cloud Function manage-kontrak

1. Di admin dashboard → section "Manajemen Kontrak"
2. Klik "Tambah Kontrak" → isi form → Submit
3. Kontrak baru harus muncul di tabel

### Cek 4: Halaman Kontrak Publik

1. Buka `http://localhost:5173/kontrak`
2. Kontrak yang dibuat di admin harus tampil (jika Appwrite terkoneksi)
3. Jika Appwrite belum terkonfigurasi, data static lokal ditampilkan

### Cek 5: Form Inspeksi

1. Login sebagai user biasa (pegawai PLN)
2. Buka dashboard → klik "Inspeksi CIVIL QTRACK"
3. Isi form → "Simpan Draft" → cek riwayat
4. Edit draft → "Kirim Laporan"

### Cek 6: Notifikasi Admin

1. Login sebagai admin
2. Setelah user submit inspeksi, cek bell icon di admin dashboard
3. Badge harus menampilkan jumlah unread
4. Klik notifikasi → navigasi ke detail inspeksi

---

## Ringkasan Resource yang Dibuat

| Resource | ID | Phase |
|---|---|---|
| **Database** | `civilqtrack-db` | C |
| **Collection** kontrak | `kontrak` | C |
| **Collection** dokumen | `dokumen` | C |
| **Collection** inspeksi | `inspeksi` | D |
| **Collection** notifikasi | `notifikasi` | D |
| **Bucket** kontrak-documents | `kontrak-documents` | C |
| **Bucket** inspeksi-photos | `inspeksi-photos` | D |
| **Function** manage-users | `manage-users` | B2 |
| **Function** manage-kontrak | `manage-kontrak` | C |
| **API Key** server-functions | *(secret)* | B2 |

---

## Troubleshooting

### Function gagal deploy
- Pastikan tar.gz dibuat dari **dalam** folder function (bukan dari parent)
- File `package.json` dan `src/main.js` harus ada di root tar.gz
- Cek **Deployments → [deployment] → Build logs** untuk error detail

### Login gagal
- Pastikan Web platform sudah ditambahkan di **Overview → Integrations**
- Hostname harus sesuai (`localhost` untuk dev)

### Permission denied saat akses collection
- Cek permissions collection di **Settings → Permissions**
- Untuk `inspeksi`: pastikan **Document security** aktif
- Untuk `notifikasi`: pastikan **Document security** aktif

### Function execution error
- Buka **Functions → [function] → Executions** untuk melihat logs
- Cek environment variables sudah benar di **Settings → Environment variables**
- Pastikan API Key memiliki scope yang cukup

### Foto tidak tampil
- Cek bucket permissions — `Users` harus punya `Read`
- Cek file extensions yang diizinkan di bucket settings

### Notifikasi admin kosong
- Pastikan collection `notifikasi` punya Document security **enabled**
- Pastikan permissions: `Users` → Create, `label:admin` → Read/Update
