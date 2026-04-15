# CIVIL QTRACK UPT Malang — Full Roadmap Overview

## Konteks Proyek

Website CIVIL QTRACK UPT Malang untuk PLN COP Civil. Saat ini berstatus Phase 1 (Static Landing Page) selesai. Dokumen ini merangkum rencana 4 fase pengembangan selanjutnya.

## Fase Pengembangan

### Phase A: Halaman Kontrak (Publik)
**Status:** Spec selesai → `2025-04-15-phase-a-halaman-kontrak-design.md`
**Scope:** Halaman `/kontrak` dan `/kontrak/:id` untuk view/download dokumen kontrak secara publik.
**Dependency:** Tidak ada.

### Phase B: Auth + Login (Appwrite Cloud)
**Status:** Belum di-spec (menunggu Phase A selesai)
**Scope:**
- Setup Appwrite Cloud project
- Implementasi auth: login/logout, session management
- Dua role: **Admin** (kelola konten & user) dan **User Pegawai PLN** (akses dashboard + form inspeksi)
- Protected routes — redirect ke login jika belum authenticated
- Halaman login dengan desain Industrial Skeuomorphism
- Tombol "Masuk" di navbar menjadi fungsional

**File baru yang direncanakan:**
- `src/lib/appwrite.js` — Appwrite SDK client configuration
- `src/context/AuthContext.jsx` — Auth state management
- `src/components/ProtectedRoute.jsx` — Route guard
- `src/pages/Login.jsx`
- `src/components/UserMenu.jsx` — Replace "Masuk" button setelah login

### Phase C: Dashboard Admin + User
**Status:** Belum di-spec (menunggu Phase B selesai)
**Scope:**
- **Dashboard Admin:**
  - CRUD user (activate/deactivate pegawai PLN)
  - CRUD konten kontrak (tambah/edit/hapus kontrak + upload dokumen)
  - File baru diupload ke Appwrite Storage, file lama tetap di `public/`
  - Migrasi `useKontrak.js` dari static config ke Appwrite Database
- **Dashboard User (Pegawai PLN):**
  - Halaman dashboard personal
  - Akses ke fitur form inspeksi (Phase D)

### Phase D: Form Inspeksi + Notifikasi
**Status:** Belum di-spec (menunggu Phase C selesai)
**Scope:**
- Form "HASIL INSPEKSI CIVIL QTRACK" di dashboard user pegawai PLN
- Field form berdasarkan template yang dimiliki user (akan di-share)
- Data form disimpan ke Appwrite Database
- Notifikasi ke admin ketika user submit form inspeksi
- Riwayat inspeksi per user

## Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + Vite 8, react-router-dom 7 |
| Styling | Custom CSS (Industrial Skeuomorphism theme), design tokens |
| Icons | lucide-react |
| Backend (Phase B+) | Appwrite Cloud — Auth, Database, Storage |
| Deployment | TBD (Vercel/Netlify untuk frontend) |

## Prinsip

- **Bertahap:** Setiap fase bisa dideploy secara independen
- **Abstraksi data layer:** Custom hooks sebagai perantara agar migrasi ke Appwrite seamless
- **Industrial Skeuomorphism:** Semua komponen baru mengikuti design system yang sudah ada
- **Formal korporat:** Tone bahasa resmi PLN di seluruh halaman
