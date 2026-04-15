# Phase A: Halaman Kontrak (Publik) — Design Spec

## Overview

Membangun halaman `/kontrak` dan `/kontrak/:id` untuk menampilkan dokumen kontrak pekerjaan sipil PT PLN (Persero) UPT Malang secara publik. Data layer diabstraksi melalui custom hook agar mudah dimigrasi ke Appwrite Database di fase selanjutnya.

**Target audiens:** Publik (tanpa login)
**Tone:** Formal korporat PLN
**Theme:** Industrial Skeuomorphism (PLN Indonesia Colors)

---

## Roadmap Konteks

Spec ini adalah **Phase A** dari rencana 4 fase:

| Phase | Scope | Dependency |
|---|---|---|
| **A: Halaman Kontrak (ini)** | Halaman publik untuk view/download dokumen kontrak | Tidak ada |
| B: Auth + Login | Appwrite Cloud setup, login/register, session management | Appwrite Cloud account |
| C: Dashboard Admin + User | Admin CRUD user & kontrak, User dashboard + form inspeksi | Phase B |
| D: Form Inspeksi + Notifikasi | Form "HASIL INSPEKSI CIVIL QTRACK", notifikasi ke admin | Phase B + C |

---

## Data Model

### Schema Kontrak

```javascript
{
  id: string,                // Slug unik, e.g. "002-pj-2025"
  nomorKontrak: string,      // "002.PJ.2025"
  namaProyek: string,        // Judul proyek pekerjaan
  tanggal: string,           // ISO date, e.g. "2025-01-15"
  status: string,            // "aktif" | "selesai" | "dalam-proses"
  dokumen: DokumenItem[]
}
```

### Schema DokumenItem

```javascript
{
  id: string,                // Slug unik, e.g. "ad-002"
  tipe: string,              // "approval-drawing" | "boq" | "spesifikasi" | "lainnya"
  nama: string,              // Display name, e.g. "Approval Drawing 002.PJ.2025"
  path: string,              // URL path ke file
  sumber: string,            // "lokal" (public/) | "appwrite" (Appwrite Storage)
  ukuran: number | null      // File size in bytes (opsional)
}
```

### Data Awal (dari folder public/docs/kontrak/)

Dua kontrak yang sudah ada. Karena `namaProyek` dan `tanggal` belum diketahui dari nama file saja, gunakan default yang bisa diedit nanti oleh admin (Phase C):

**Kontrak 002.PJ.2025:**
- `namaProyek`: "Pekerjaan Sipil 002.PJ.2025" (default, bisa diedit di Phase C)
- `tanggal`: "2025-01-01" (placeholder)
- `status`: "aktif"
- Approval Drawing 002.PJ.2025.pdf → `/docs/kontrak/Kontrak 002.PJ.2025/Approval Drawing 002.PJ.2025.pdf`
- BOQ 002.PJ.2025.pdf → `/docs/kontrak/Kontrak 002.PJ.2025/BOQ 002.PJ.2025.pdf`

**Kontrak 005.PJ.2025:**
- `namaProyek`: "Pekerjaan Sipil 005.PJ.2025" (default, bisa diedit di Phase C)
- `tanggal`: "2025-01-01" (placeholder)
- `status`: "aktif"
- Approval Drawing 005.PJ.2025.pdf → `/docs/kontrak/Kontrak 005.PJ.2025/Approval Drawing 005.PJ.2025.pdf`
- BOQ 005.2025.pdf → `/docs/kontrak/Kontrak 005.PJ.2025/BOQ 005.2025.pdf`

---

## Arsitektur

### Abstraksi Data Layer

```
src/data/kontrak.js          ← Static config (Phase A)
         ↓
src/hooks/useKontrak.js      ← Custom hook (abstraksi)
         ↓                      Nanti: switch ke Appwrite SDK
src/pages/KontrakPage.jsx    ← Consumer
src/pages/KontrakDetailPage.jsx
```

**`useKontrak()` hook** menyediakan:
- `kontrakList` — array semua kontrak
- `getKontrakById(id)` — ambil satu kontrak berdasarkan ID
- `loading` — boolean state (selalu false untuk static, true saat fetch Appwrite nanti)
- `error` — error state

Ketika migrasi ke Appwrite di Phase C, hanya `src/hooks/useKontrak.js` yang perlu diubah. Semua komponen UI tetap sama.

---

## Halaman & Navigasi

### Route `/kontrak` — Daftar Kontrak

**URL:** `/kontrak`
**Komponen:** `KontrakPage`

**Konten kalimat (formal korporat):**
- **Section subtitle (monospace, uppercase):** `DOKUMENTASI RESMI`
- **Heading:** `Dokumentasi Kontrak`
- **Deskripsi:** `Akses dokumen resmi kontrak pekerjaan sipil PT PLN (Persero) UPT Malang. Tersedia dokumen Approval Drawing, Bill of Quantity (BOQ), dan dokumen pendukung lainnya untuk setiap paket pekerjaan.`
- **Empty state:** `Belum terdapat dokumen kontrak yang tersedia saat ini.`

**Layout:**
- Section header di atas (mengikuti pattern `.section-header` yang sudah ada)
- Card grid di bawah: 3 kolom desktop, 2 kolom tablet, 1 kolom mobile
- Setiap card menampilkan: nomor kontrak, nama proyek, jumlah dokumen, badge status

### Route `/kontrak/:id` — Detail Kontrak

**URL:** `/kontrak/:id` (e.g. `/kontrak/002-pj-2025`)
**Komponen:** `KontrakDetailPage`

**Konten kalimat:**
- **Breadcrumb:** `Kontrak / 002.PJ.2025`
- **Heading:** `Kontrak {nomorKontrak}`
- **Sub-heading:** Nama proyek
- **Section dokumen:** `Dokumen Terkait`
- **Tombol kembali:** `Kembali ke Daftar Kontrak`

**Layout:**
- Breadcrumb navigation di atas
- Info kontrak (nomor, proyek, tanggal, status)
- Daftar dokumen — setiap item punya tombol "Preview" dan "Download"
- PDF viewer area — tampil saat user klik "Preview" pada salah satu dokumen
- Tombol kembali ke `/kontrak`

**404 handling:** Jika ID kontrak tidak ditemukan, tampilkan pesan:
`Kontrak tidak ditemukan. Silakan kembali ke daftar kontrak.`

---

## Komponen UI

### File Baru

| File | Tanggung Jawab |
|---|---|
| `src/data/kontrak.js` | Static config: array kontrak dengan metadata dan daftar dokumen |
| `src/hooks/useKontrak.js` | Custom hook: abstraksi data layer, return `{ kontrakList, getKontrakById, loading, error }` |
| `src/pages/KontrakPage.jsx` | Halaman daftar kontrak: section header + card grid |
| `src/pages/KontrakDetailPage.jsx` | Halaman detail: breadcrumb + info + daftar dokumen + PDF viewer |
| `src/components/KontrakCard.jsx` | Card kontrak: Industrial "Bolted Module" style dengan corner screws, neumorphic shadow |
| `src/components/PdfViewer.jsx` | Embedded PDF preview: menggunakan `<iframe>` dengan fallback, "Recessed Screen" style |
| `src/components/DokumenItem.jsx` | Baris per-dokumen: ikon tipe file + nama + badge tipe + tombol preview/download |

### File yang Dimodifikasi

| File | Perubahan |
|---|---|
| `src/App.jsx` | Tambah import `KontrakPage` dan `KontrakDetailPage`, tambah route `/kontrak` dan `/kontrak/:id` |
| `src/components/BottomNav.jsx` | Ganti nav item `/pekerjaan-beton` (label "Beton") menjadi `/kontrak` (label "Kontrak") dengan ikon `FileText` dari lucide-react |
| `src/styles/components.css` | Tambah CSS class untuk komponen kontrak baru |

---

## Styling (Industrial Skeuomorphism)

### KontrakCard

- Menggunakan pattern `.card` yang sudah ada (neumorphic shadow + corner screws pseudo-element)
- Nomor kontrak sebagai heading (font-weight 700, tight tracking)
- Badge status: menggunakan pattern `.badge` (monospace, uppercase, stamped label)
- Badge tipe dokumen: warna accent PLN Blue
- Hover: `translateY(-4px)` + shadow upgrade

### PdfViewer

- Container dengan recessed shadow: `inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff`
- Border radius 16px (lg)
- Header bar di atas iframe: background gelap (`#2d3436`), monospace font untuk nama file
- Tombol fullscreen dan close di header bar
- Fallback text jika browser tidak support PDF embed

### DokumenItem

- Layout flex: ikon (recessed icon housing) + nama file + badge tipe + tombol aksi
- Ikon per tipe: `FileImage` untuk approval-drawing, `FileSpreadsheet` untuk BOQ, `FileText` untuk lainnya
- Tombol "Preview" (secondary button) dan "Download" (primary button)
- Hover: background muted + subtle recessed shadow

### Responsive

- Card grid: `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3`
- PDF viewer: full width, height 70vh desktop / 50vh mobile
- DokumenItem: stack vertikal pada mobile (tombol di bawah)
- Minimum touch target 48px pada mobile

### PDF Viewer — Mobile Fallback

Banyak mobile browser tidak support `<iframe>` untuk PDF. Strategi:
- Deteksi perangkat mobile via viewport width atau user agent
- Pada mobile: jangan tampilkan iframe, langsung tawarkan tombol "Buka PDF" (membuka di tab baru) dan "Download"
- Pada desktop: tampilkan iframe embed + tombol download

---

## Error Handling

- **PDF tidak bisa load:** Tampilkan fallback message + link download langsung
- **Kontrak tidak ditemukan (404):** Pesan error + tombol kembali ke daftar
- **Data kosong:** Empty state dengan ikon dan pesan informatif

---

## Tidak Termasuk dalam Scope Phase A

- CRUD kontrak oleh admin (Phase C)
- Upload file ke Appwrite Storage (Phase C)
- Autentikasi/login (Phase B)
- Search/filter kontrak (bisa ditambah nanti)
- Integrasi Appwrite Database (Phase C — hanya perlu ubah `useKontrak.js`)
