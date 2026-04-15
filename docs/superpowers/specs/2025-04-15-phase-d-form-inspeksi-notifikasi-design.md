# Phase D: Form Inspeksi + Notifikasi — Design Spec

## Overview

Mengimplementasikan form pelaporan "HASIL INSPEKSI CIVIL QTRACK" untuk pegawai PLN, dengan penyimpanan data ke Appwrite Database, upload foto ke Appwrite Storage, dan notifikasi ke admin saat form disubmit.

---

## Form Template Analysis

Berdasarkan `docs/CIVIL QTRACK.xlsx` sheet "INPUTAN FORM":

### Hierarki Form

```
Jenis Pekerjaan
  └── Inspeksi Pekerjaan
        └── Item Inspeksi → Output (input type)
```

### 1. Pekerjaan Beton

**1.1 Slump Test**
| Item Inspeksi | Output |
|---|---|
| Surat Jalan Mixer Truck | Upload foto |
| Alat uji (kerucut, batang penusuk, alas) | Upload foto |
| Hasil Pengukuran Slump Test | Input nilai (cm) |
| Dokumentasi pengujian | Upload foto |
| Catatan | Uraian singkat |

**1.2 Penuangan Beton (Placing)**
| Item Inspeksi | Output |
|---|---|
| Tinggi jatuh penuangan beton | Input nilai (m) |
| Dokumentasi pengujian | Upload foto |
| Catatan | Uraian singkat |

**1.3 Pemadatan**
| Item Inspeksi | Output |
|---|---|
| Jumlah titik pemadatan | Input nilai |
| Durasi pemadatan tiap titik | Input nilai (detik) |
| Dokumentasi pengujian | Upload foto |
| Catatan | Uraian singkat |

**1.4 Pengambilan Sampel**
| Item Inspeksi | Output |
|---|---|
| Jumlah sampel | Input nilai |
| Dokumentasi pengujian | Upload foto |
| Catatan | Uraian singkat |

**1.5 Curing**
| Item Inspeksi | Output |
|---|---|
| Jenis curing | Dropdown: penyiraman, genangan, terpal, curing compound |
| Durasi Curing | Input nilai (hari) |
| Dokumentasi pengujian | Upload foto |
| Catatan | Uraian singkat |

### 2. Pekerjaan Baja

**2.1 Visual Testing**
| Item Inspeksi | Output |
|---|---|
| Diameter tulangan utama | Input nilai (mm) |
| Jarak tulangan | Input nilai (cm) |
| Jarak sengkang | Input nilai (cm) |
| Kesesuaian dengan gambar kerja | Dropdown: sesuai, tidak sesuai |
| Dokumentasi pengujian | Upload foto |
| Catatan | Uraian singkat |

**2.2 Torque Wrench Test**
| Item Inspeksi | Output |
|---|---|
| Diameter baut | Input nilai (mm) |
| Grade | Input nilai |
| Nilai torsi | Input nilai (Nm) |
| Dokumentasi pengujian | Upload foto |
| Catatan | Uraian singkat |

### 3. Pekerjaan Kayu

**3.1 Visual Inspection**
| Item Inspeksi | Output |
|---|---|
| Dokumentasi pengujian | Upload foto |
| Catatan | Uraian singkat |

### Input Types Summary

| Tipe | Jumlah | Implementasi |
|---|---|---|
| Upload foto | 13 | File input (accept: image/*), preview thumbnail, upload ke Storage |
| Input nilai + satuan | 11 | Number input + unit label |
| Dropdown | 2 | Select element |
| Uraian singkat | 8 | Textarea |

---

## Form UX: Multi-Step Wizard

### Alur Form

```
Step 1: Informasi Umum
  ├── Tanggal Inspeksi (date)
  ├── Lokasi / Nama GI (text)
  ├── Kontrak terkait (select, optional — dari data kontrak)
  └── Pilih Jenis Pekerjaan (checkbox: Beton, Baja, Kayu — min 1)

Step 2: Pekerjaan Beton (jika dipilih)
  ├── Accordion: Slump Test
  ├── Accordion: Penuangan Beton
  ├── Accordion: Pemadatan
  ├── Accordion: Pengambilan Sampel
  └── Accordion: Curing

Step 3: Pekerjaan Baja (jika dipilih)
  ├── Accordion: Visual Testing
  └── Accordion: Torque Wrench Test

Step 4: Pekerjaan Kayu (jika dipilih)
  └── Accordion: Visual Inspection

Step Final: Ringkasan & Kirim
  ├── Review semua data yang diisi
  ├── Tombol "Simpan Draft" dan "Kirim Laporan"
  └── Konfirmasi dialog sebelum kirim
```

### Step Navigation

- Progress indicator di atas form (step 1/2/3...)
- Tombol "Sebelumnya" dan "Selanjutnya"
- Step yang belum dipilih di Step 1 otomatis di-skip
- Validasi per step sebelum lanjut

### Perilaku Draft

- User bisa "Simpan Draft" kapan saja (status: `draft`)
- Draft bisa diedit kembali dari riwayat
- "Kirim Laporan" → status: `submitted`, tidak bisa diedit lagi
- Foto yang sudah diupload tetap tersimpan di Storage

---

## Appwrite Prerequisites

### 1. Collection: `inspeksi`

| Attribute | Type | Required | Keterangan |
|---|---|---|---|
| `userId` | string (36) | Ya | User ID pengirim |
| `userName` | string (100) | Ya | Nama user (denormalized) |
| `tanggalInspeksi` | string (30) | Ya | ISO date string |
| `lokasi` | string (200) | Ya | Lokasi / Nama GI |
| `kontrakId` | string (36) | Tidak | Reference ke kontrak (optional) |
| `jenisPekerjaan` | string (100) | Ya | Comma-separated: beton,baja,kayu |
| `data` | string (1000000) | Ya | JSON string seluruh form responses |
| `fotoIds` | string (10000) | Ya | JSON array of Storage file IDs |
| `status` | string (20) | Ya | draft / submitted |
| `submittedAt` | string (30) | Tidak | ISO timestamp saat submit |

**Permissions:**
- Read: `users` (hanya user terautentikasi)
- Create: `users`
- Update: document-level (pemilik saja) — ENABLE document security
- Delete: `label:admin`

**Note:** Document security diaktifkan agar setiap inspeksi hanya bisa diedit oleh pembuatnya. Saat create, set permission `read("user:{userId}")`, `update("user:{userId}")`, `read("label:admin")`, `delete("label:admin")`.

### 2. Collection: `notifikasi`

| Attribute | Type | Required | Keterangan |
|---|---|---|---|
| `type` | string (30) | Ya | inspeksi_submitted |
| `message` | string (500) | Ya | Deskripsi notifikasi |
| `referenceId` | string (36) | Ya | inspeksi.$id |
| `userId` | string (36) | Ya | User yang men-trigger |
| `userName` | string (100) | Ya | Nama user |
| `read` | boolean | Ya | Default: false |
| `createdAt` | string (30) | Ya | ISO timestamp |

**Permissions:** Read/Update `label:admin`, Create `users`

### 3. Storage Bucket: `inspeksi-photos`

- Allowed extensions: jpg, jpeg, png, webp
- Max file size: 10MB
- **Permissions:** Read `users` + `label:admin`, Create `users`, Delete `label:admin`

### 4. Environment Variables

Tambahan ke `.env`:

```
VITE_APPWRITE_COLLECTION_INSPEKSI=...
VITE_APPWRITE_COLLECTION_NOTIFIKASI=...
VITE_APPWRITE_BUCKET_INSPEKSI=...
```

---

## Data Structure: `data` JSON Field

Semua form responses disimpan sebagai JSON string di field `data`. Struktur:

```json
{
  "beton": {
    "slumpTest": {
      "suratJalan": { "fileId": "abc123" },
      "alatUji": { "fileId": "def456" },
      "hasilPengukuran": { "value": 12, "unit": "cm" },
      "dokumentasi": { "fileId": "ghi789" },
      "catatan": "Kondisi normal"
    },
    "penuanganBeton": {
      "tinggiJatuh": { "value": 1.5, "unit": "m" },
      "dokumentasi": { "fileId": "..." },
      "catatan": ""
    },
    "pemadatan": { ... },
    "pengambilanSampel": { ... },
    "curing": { ... }
  },
  "baja": {
    "visualTesting": { ... },
    "torqueWrenchTest": { ... }
  },
  "kayu": {
    "visualInspection": { ... }
  }
}
```

Keuntungan JSON blob:
- Fleksibel — form field bisa ditambah tanpa migrasi schema
- Simpel — 1 collection, 1 document per inspeksi
- Cukup untuk kebutuhan saat ini

---

## File Baru

| File | Tanggung Jawab |
|---|---|
| `src/data/inspeksiSchema.js` | Static definition form fields per section (source of truth) |
| `src/hooks/useInspeksi.js` | Hook CRUD inspeksi + foto upload via Web SDK |
| `src/hooks/useNotifikasi.js` | Hook baca/update notifikasi (admin) + create (user) |
| `src/pages/InspeksiFormPage.jsx` | Multi-step wizard form page |
| `src/pages/InspeksiListPage.jsx` | Riwayat inspeksi user / daftar semua inspeksi admin |
| `src/pages/InspeksiDetailPage.jsx` | View detail inspeksi (read-only) |
| `src/components/inspeksi/StepProgress.jsx` | Progress indicator |
| `src/components/inspeksi/StepInfoUmum.jsx` | Step 1: informasi umum |
| `src/components/inspeksi/StepPekerjaan.jsx` | Step 2-4: generic step per jenis pekerjaan |
| `src/components/inspeksi/StepRingkasan.jsx` | Step final: review + submit |
| `src/components/inspeksi/InspeksiField.jsx` | Render field by type (number+unit, photo, dropdown, textarea) |
| `src/components/inspeksi/PhotoUpload.jsx` | Photo upload with preview + progress |
| `src/components/admin/NotifikasiBadge.jsx` | Badge unread count di admin dashboard header |
| `src/components/admin/NotifikasiPanel.jsx` | Panel daftar notifikasi |

## File yang Dimodifikasi

| File | Perubahan |
|---|---|
| `.env.example` | Tambah env vars inspeksi + notifikasi |
| `src/lib/appwrite.js` | Tidak perlu perubahan (Databases & Storage sudah ada) |
| `src/pages/UserDashboard.jsx` | Enable kartu Inspeksi, tambah link riwayat |
| `src/pages/AdminDashboard.jsx` | Tambah notifikasi badge + panel, section daftar inspeksi |
| `src/App.jsx` | Tambah routes inspeksi |
| `src/styles/components.css` | CSS form wizard, steps, fields, photo upload |
| `src/styles/layouts.css` | Responsive rules |

---

## Routing

| Route | Component | Auth | Keterangan |
|---|---|---|---|
| `/inspeksi/baru` | InspeksiFormPage | ProtectedRoute | Form baru |
| `/inspeksi/:id/edit` | InspeksiFormPage | ProtectedRoute | Edit draft |
| `/inspeksi` | InspeksiListPage | ProtectedRoute | Riwayat user |
| `/inspeksi/:id` | InspeksiDetailPage | ProtectedRoute | Detail read-only |
| `/admin/inspeksi` | InspeksiListPage | ProtectedRoute adminOnly | Semua inspeksi |
| `/admin/inspeksi/:id` | InspeksiDetailPage | ProtectedRoute adminOnly | Detail admin |

---

## Notification Flow

```
User submit form inspeksi
  → Client creates inspeksi document (status: submitted)
  → Client creates notifikasi document {
      type: 'inspeksi_submitted',
      message: '{userName} mengirim laporan inspeksi untuk {lokasi}',
      referenceId: inspeksi.$id,
      ...
    }

Admin sees notification:
  → NotifikasiBadge di dashboard header shows unread count
  → Click → NotifikasiPanel lists recent notifications
  → Click notifikasi → navigate to /admin/inspeksi/:id
  → Notifikasi marked as read
```

Notifikasi dibuat langsung dari client (bukan Cloud Function) karena:
- Sederhana — tidak perlu Cloud Function tambahan
- Collection permission sudah cukup (create: users, read/update: admin)
- Tidak perlu server-side trigger

---

## Tidak Termasuk dalam Scope

- Email/push notifications (hanya in-app)
- Export inspeksi ke PDF
- Dashboard analytics/charts
- Bulk operations pada inspeksi
- Offline form support
- Photo compression/resize (upload as-is)
- Approval workflow (admin approve/reject)
