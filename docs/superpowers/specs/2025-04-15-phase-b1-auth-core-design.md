# Sub-Phase B1: Auth Core — Design Spec

## Overview

Mengintegrasikan Appwrite Cloud sebagai backend autentikasi untuk CIVIL QTRACK UPT Malang. Scope meliputi setup Appwrite SDK, login/logout, session management, protected routes, dan update navbar. Halaman publik (Home, Kontrak) tetap bisa diakses tanpa login.

**Auth model:** Invite-based — hanya admin yang bisa membuat akun user (di Sub-Phase B2). Tidak ada halaman register publik.
**Role system:** Appwrite Labels — `admin` label untuk admin, user tanpa label = pegawai PLN biasa.
**Admin pertama:** Dibuat manual via Appwrite Console.

---

## Roadmap Konteks

| Sub-Phase | Scope | Status |
|---|---|---|
| **B1: Auth Core (ini)** | Appwrite setup, login, logout, AuthContext, ProtectedRoute, UserMenu, dashboard placeholder | Spec ini |
| B2: Admin User Management | Appwrite Function create-user, admin dashboard layout, CRUD user | Menunggu B1 |

---

## Prerequisites

Sebelum implementasi dimulai, user perlu:

1. Buat project baru di [cloud.appwrite.io](https://cloud.appwrite.io)
2. Di project settings, catat **Project ID** dan **Endpoint** (biasanya `https://cloud.appwrite.io/v1`)
3. Di Auth settings, pastikan `Email/Password` authentication method aktif
4. Buat user pertama (admin) via Appwrite Console → Users → Create User
5. Set label `admin` pada user tersebut via Appwrite Console → Users → klik user → Labels → tambah `admin`

---

## Environment Variables

File `.env` (tidak di-commit, tambahkan ke `.gitignore`):

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=<project-id-dari-console>
```

File `.env.example` (di-commit sebagai template):

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id-here
```

---

## Dependency Baru

```
appwrite (Appwrite Web SDK)
```

Install via: `npm install appwrite`

---

## Arsitektur

```
src/lib/appwrite.js              ← Appwrite Client + Account instance
         ↓
src/context/AuthContext.jsx       ← Auth state management (user, login, logout)
         ↓
src/components/ProtectedRoute.jsx ← Route guard (redirect jika belum auth)
src/components/UserMenu.jsx       ← Navbar menu setelah login
src/pages/Login.jsx               ← Halaman login
src/pages/AccessDenied.jsx        ← Halaman "Akses Ditolak" (role tidak sesuai)
```

---

## File Baru

| File | Tanggung Jawab |
|---|---|
| `.env.example` | Template environment variables |
| `src/lib/appwrite.js` | Appwrite Client configuration — export `client`, `account`, `ID` |
| `src/context/AuthContext.jsx` | React Context + Provider: user state, login, logout, isAdmin, isAuthenticated, loading |
| `src/components/ProtectedRoute.jsx` | Route wrapper: redirect ke `/login` jika belum auth, cek role opsional |
| `src/components/UserMenu.jsx` | Dropdown menu di navbar: nama user + link ke dashboard + logout |
| `src/pages/Login.jsx` | Halaman login: form email/password, error handling, post-login redirect |
| `src/pages/AccessDenied.jsx` | Halaman error "Akses Ditolak" untuk user tanpa role yang sesuai |

## File yang Dimodifikasi

| File | Perubahan |
|---|---|
| `.gitignore` | Tambah `.env` |
| `package.json` | Tambah dependency `appwrite` |
| `src/App.jsx` | Bungkus dengan `AuthProvider`, tambah route `/login`, `/dashboard`, `/admin/dashboard`, `/access-denied` |
| `src/components/Navbar.jsx` | Ganti tombol "Masuk" dengan `UserMenu` (jika login) atau Link ke `/login` (jika belum) |
| `src/components/BottomNav.jsx` | Tidak diubah (mobile nav tetap publik) |
| `src/styles/components.css` | Tambah CSS untuk login form, user menu, access denied |
| `src/styles/layouts.css` | Tambah layout login page |

---

## Detail Komponen

### `src/lib/appwrite.js`

```javascript
import { Client, Account, ID } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);

export { client, account, ID };
```

### `src/context/AuthContext.jsx`

**State:**
- `user` — Appwrite user object atau `null`
- `loading` — `true` saat init (cek session existing)

**Computed:**
- `isAdmin` — `user?.labels?.includes('admin') ?? false`
- `isAuthenticated` — `user !== null`

**Methods:**
- `login(email, password)` — `account.createEmailPasswordSession()` lalu `account.get()`
- `logout()` — `account.deleteSession('current')`, set user null

**Init flow:**
1. Mount → set `loading: true`
2. `account.get()` — jika sukses, set `user`; jika error (401), set `user: null`
3. Set `loading: false`

**Error handling:**
- Login gagal → throw error dengan message dari Appwrite (e.g. "Invalid credentials")
- Session check gagal → set user null (bukan error, artinya belum login)

### `src/components/ProtectedRoute.jsx`

**Props:**
- `children` — child component (halaman yang dilindungi)
- `adminOnly` — boolean opsional (default `false`). Jika `true`, hanya user dengan label `admin` yang bisa akses.

**Logic:**
1. Jika `loading` → tampilkan loading spinner
2. Jika `!isAuthenticated` → `<Navigate to="/login" />`
3. Jika `adminOnly === true` dan `!isAdmin` → `<Navigate to="/access-denied" />`
4. Jika OK → render `children`

**Catatan:** Tanpa `adminOnly`, route dilindungi untuk semua user yang sudah login (admin maupun pegawai PLN).

### `src/components/UserMenu.jsx`

**Tampilan:**
- Tombol dengan nama user (atau email jika nama kosong)
- Klik → dropdown muncul:
  - "Dashboard" → navigate ke `/admin/dashboard` (admin) atau `/dashboard` (user)
  - Divider
  - "Keluar" → logout, redirect ke `/`

**Design:** Industrial Skeuomorphism — dropdown sebagai "Panel Module", item sebagai ghost button

### `src/pages/Login.jsx`

**Layout:**
- Centered card (Bolted Module style) di tengah halaman
- PLN Logo di atas card (opsional, jika sudah ada)
- Form: 2 input field (Email, Password) dalam "Recessed Data Slot" style
- Tombol "Masuk" (Physical Key primary style)
- Error message di bawah form jika login gagal

**Konten kalimat:**
- Heading: `Masuk ke CIVIL QTRACK`
- Subtext: `Sistem Manajemen Inspeksi Pekerjaan Sipil PT PLN (Persero) UPT Malang`
- Email label: `Alamat Email`
- Password label: `Kata Sandi`
- Tombol: `Masuk`
- Error: `Email atau kata sandi tidak valid. Silakan coba kembali.`
- Loading state pada tombol: `Memproses...`

**Behavior:**
- Jika sudah login → redirect ke dashboard (berdasarkan role)
- Form validation: email required + format valid, password required + min 8 char
- Error handling: tampilkan pesan error dari Appwrite

### `src/pages/AccessDenied.jsx`

**Layout:**
- Centered content (mirip UnderConstruction)
- Ikon `ShieldAlert` dari lucide-react
- Heading: `Akses Ditolak`
- Text: `Anda tidak memiliki izin untuk mengakses halaman ini.`
- Tombol: `Kembali ke Beranda`

---

## Routing Update (App.jsx)

```
/ → Home (publik)
/panduan → UnderConstruction (publik)
/kontrak → KontrakPage (publik)
/kontrak/:id → KontrakDetailPage (publik)
/qna → UnderConstruction (publik)
/login → Login (publik, redirect jika sudah login)
/dashboard → ProtectedRoute → UnderConstruction "Dashboard" (semua user yang login)
/admin/dashboard → ProtectedRoute(adminOnly) → UnderConstruction "Admin Dashboard" (hanya admin)
/access-denied → AccessDenied (publik)
```

**Wrapper:** `<AuthProvider>` ditempatkan di dalam `<BrowserRouter>` (agar komponen auth bisa menggunakan `useNavigate`) dan di dalam `<ThemeProvider>`:

```
<ThemeProvider>
  <BrowserRouter>
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  </BrowserRouter>
</ThemeProvider>
```

---

## Styling (Industrial Skeuomorphism)

### Login Form

- Card container: `.login-card` — neumorphic shadow, corner screws, centered
- Input fields: `.login-input` — recessed shadow (`--shadow-recessed`), monospace placeholder
- Labels: monospace, uppercase, tracking wide
- Submit button: full-width primary button
- Error message: merah (#dc2626) dengan ikon AlertCircle

### UserMenu

- Trigger button: `.user-menu-btn` — neumorphic, tampilkan initial/avatar + nama
- Dropdown: `.user-menu-dropdown` — panel module shadow, slide-down animation
- Menu items: ghost button style, hover background muted
- Logout item: warna accent merah pada hover

### Loading State

- Saat `AuthContext.loading === true`, App menampilkan full-page loader
- Desain: centered spinner dengan PLN Blue accent glow

---

## Tidak Termasuk dalam Scope B1

- Registrasi user / create user (Sub-Phase B2)
- Dashboard admin dengan konten (Sub-Phase B2)
- Dashboard user dengan form inspeksi (Phase C-D)
- Appwrite Function untuk server-side operations (Sub-Phase B2)
- Appwrite Database collections (Sub-Phase B2)
- Password reset / forgot password (bisa ditambah nanti)
