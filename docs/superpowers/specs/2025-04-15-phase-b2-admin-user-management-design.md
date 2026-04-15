# Sub-Phase B2: Admin User Management — Design Spec

## Overview

Menambahkan fitur manajemen user (CRUD) untuk admin di CIVIL QTRACK UPT Malang. Admin dapat membuat, melihat, mengedit, dan menghapus akun user melalui dashboard admin. Operasi server-side menggunakan Appwrite Cloud Function dengan Node.js Server SDK.

**Auth model:** Invite-based — hanya admin yang bisa membuat akun user.
**Security:** Cloud Function dengan execute permission `label:admin` — hanya user berlabel admin yang bisa memanggil function.

---

## Roadmap Konteks

| Sub-Phase | Scope | Status |
|---|---|---|
| B1: Auth Core | Appwrite setup, login, logout, AuthContext, ProtectedRoute, UserMenu | Selesai |
| **B2: Admin User Management (ini)** | Cloud Function manage-users, admin dashboard, CRUD user | Spec ini |

---

## Arsitektur

```
Frontend (React + Appwrite Web SDK)
         │
         │  functions.createExecution({ functionId, body, method, xpath })
         ▼
Appwrite Cloud Function "manage-users"
  ├── Execute permission: label:admin
  ├── Runtime: Node.js 18+
  ├── Env var: APPWRITE_API_KEY (Server SDK key)
  └── Uses: node-appwrite Server SDK
         │
         │  users.create(), users.list(), users.get(),
         │  users.updateName(), users.updateEmail(),
         │  users.updateLabels(), users.delete()
         ▼
Appwrite Auth (User Management)
```

### Data Flow

1. Admin membuka `/admin/dashboard` → frontend fetch daftar user via Cloud Function
2. Admin klik "Tambah User" → modal form → submit → Cloud Function create user
3. Admin klik "Edit" → modal form prefilled → submit → Cloud Function update user
4. Admin klik "Hapus" → konfirmasi → Cloud Function delete user

---

## Prerequisites

Sebelum implementasi frontend dapat berfungsi penuh, user perlu:

1. **Buat Cloud Function** di Appwrite Console:
   - Nama: `manage-users`
   - Runtime: Node.js 18.0 atau lebih baru
   - Entrypoint: `src/main.js`
   - Execute permission: `label:admin`
2. **Buat API Key** di Appwrite Console → API Keys → Create Key
   - Scope minimal: `users.read`, `users.write`
3. **Set environment variable** di function settings:
   - Key: `APPWRITE_API_KEY`, Value: API key dari step 2
4. **Deploy function code** dari `functions/manage-users/` via Appwrite CLI atau Console upload
5. **Tambahkan Function ID** ke `.env`:
   - `VITE_APPWRITE_FUNCTION_MANAGE_USERS=<function-id>`

---

## Environment Variables

Tambahan ke `.env` (dan `.env.example`):

```
VITE_APPWRITE_FUNCTION_MANAGE_USERS=your-function-id-here
```

---

## File Baru

### Cloud Function

| File | Tanggung Jawab |
|---|---|
| `functions/manage-users/package.json` | Dependencies: `node-appwrite` |
| `functions/manage-users/src/main.js` | Function entry point — route handler untuk CRUD user |

### Frontend

| File | Tanggung Jawab |
|---|---|
| `src/hooks/useUsers.js` | Custom hook — panggil Cloud Function, manage state daftar user |
| `src/pages/AdminDashboard.jsx` | Halaman dashboard admin — layout + user management |
| `src/components/admin/UserTable.jsx` | Tabel daftar user dengan aksi edit/hapus |
| `src/components/admin/UserFormModal.jsx` | Modal form untuk create/edit user |
| `src/components/admin/DeleteConfirmModal.jsx` | Modal konfirmasi hapus user |

### File yang Dimodifikasi

| File | Perubahan |
|---|---|
| `.env.example` | Tambah `VITE_APPWRITE_FUNCTION_MANAGE_USERS` |
| `src/lib/appwrite.js` | Tambah import dan export `Functions` instance |
| `src/App.jsx` | Ganti placeholder `UnderConstruction` di `/admin/dashboard` dengan `AdminDashboard` |
| `src/styles/components.css` | Tambah CSS untuk admin dashboard, tabel, modal |
| `src/styles/layouts.css` | Tambah layout admin dashboard + responsive |

---

## Detail Cloud Function: `manage-users`

### `functions/manage-users/package.json`

```json
{
  "name": "manage-users",
  "version": "1.0.0",
  "type": "module",
  "main": "src/main.js",
  "dependencies": {
    "node-appwrite": ">=14.0.0"
  }
}
```

### `functions/manage-users/src/main.js`

**Request routing** berdasarkan `req.method` dan `req.path`:

| Method | Path | Action | Body |
|---|---|---|---|
| `GET` | `/users` | List users | — (query params: `search`, `limit`, `offset`) |
| `POST` | `/users` | Create user | `{ name, email, password, role }` |
| `PATCH` | `/users/:id` | Update user | `{ name?, email?, role? }` |
| `DELETE` | `/users/:id` | Delete user | — |

**Init:**
```javascript
import { Client, Users, ID, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const users = new Users(client);
  // ... route handling
};
```

Catatan: `APPWRITE_FUNCTION_API_ENDPOINT` dan `APPWRITE_FUNCTION_PROJECT_ID` adalah environment variables yang otomatis tersedia di setiap Appwrite Cloud Function.

**List users (GET /users):**
- Parse query params dari `req.query` (search, limit=25, offset=0)
- Panggil `users.list(queries)` dengan `Query.limit()`, `Query.offset()`, optional `Query.search('name', search)`
- Return: `{ total, users: [{ $id, name, email, labels, status, registration }] }`

**Create user (POST /users):**
- Parse body: `{ name, email, password, role }`
- Validasi: name required, email required + format, password required + min 8 char, role harus `admin` atau `user`
- Panggil `users.create(ID.unique(), email, undefined, password, name)`
- Jika role === 'admin': panggil `users.updateLabels(userId, ['admin'])`
- Return: created user object

**Update user (PATCH /users/:id):**
- Parse body: `{ name?, email?, role? }`
- Parse userId dari path
- Jika name: `users.updateName(userId, name)`
- Jika email: `users.updateEmail(userId, email)`
- Jika role: `users.updateLabels(userId, role === 'admin' ? ['admin'] : [])`
- Return: updated user object via `users.get(userId)`

**Delete user (DELETE /users/:id):**
- Parse userId dari path
- Cegah admin menghapus diri sendiri (bandingkan `req.headers['x-appwrite-user-id']` dengan target userId)
- Panggil `users.delete(userId)`
- Return: `{ success: true }`

**Error handling:**
- Semua error di-catch dan return `res.json({ error: message }, statusCode)`
- Validasi input return 400
- User not found return 404
- Self-delete attempt return 403

---

## Detail Frontend

### `src/lib/appwrite.js` (Modifikasi)

Tambah:
```javascript
import { Client, Account, Functions, ID } from 'appwrite';
// ...
const functions = new Functions(client);
export { client, account, functions, ID };
```

### `src/hooks/useUsers.js`

**State:**
- `users` — array of user objects
- `total` — total count
- `loading` — boolean
- `error` — string atau null

**Methods (semua memanggil Cloud Function via `functions.createExecution`):**
- `fetchUsers(search?, limit?, offset?)` — GET /users
- `createUser({ name, email, password, role })` — POST /users
- `updateUser(id, { name?, email?, role? })` — PATCH /users/:id
- `deleteUser(id)` — DELETE /users/:id

**Helper function:**
```javascript
async function callManageUsers(method, path, body = null) {
  const execution = await functions.createExecution({
    functionId: import.meta.env.VITE_APPWRITE_FUNCTION_MANAGE_USERS,
    method,
    xpath: path,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  });

  const response = JSON.parse(execution.responseBody);
  if (execution.responseStatusCode >= 400) {
    throw new Error(response.error || 'Terjadi kesalahan');
  }
  return response;
}
```

### `src/pages/AdminDashboard.jsx`

**Layout:**
```
┌──────────────────────────────────────────────┐
│ Dashboard Admin                              │
│ Manajemen Sistem CIVIL QTRACK UPT Malang     │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──── Manajemen User ────────────────────┐  │
│  │                                        │  │
│  │  [🔍 Cari user...]      [+ Tambah User]│  │
│  │                                        │  │
│  │  ┌─────────────────────────────────┐   │  │
│  │  │ Nama  │ Email │ Role │ Aksi     │   │  │
│  │  │───────│───────│──────│──────────│   │  │
│  │  │ ...   │ ...   │ ...  │ ✏️ 🗑️    │   │  │
│  │  │ ...   │ ...   │ ...  │ ✏️ 🗑️    │   │  │
│  │  └─────────────────────────────────┘   │  │
│  │                                        │  │
│  │  Menampilkan 1-10 dari 25 user         │  │
│  │  [← Sebelumnya]         [Berikutnya →] │  │
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

**Konten:**
- Heading: `Dashboard Admin`
- Subtext: `Manajemen Sistem CIVIL QTRACK UPT Malang`
- Section heading: `Manajemen User`

**State:**
- `search` — search query (debounced 300ms)
- `page` — current page (offset = (page-1) * limit)
- `showCreateModal` — boolean
- `editingUser` — user object or null
- `deletingUser` — user object or null

**Behavior:**
- Mount → `fetchUsers()`
- Search → debounce 300ms → `fetchUsers(search)`
- Pagination → update page → `fetchUsers(search, limit, newOffset)`
- Create/Edit/Delete success → refetch user list + tutup modal
- Error → tampilkan toast/inline error

### `src/components/admin/UserTable.jsx`

**Props:**
- `users` — array
- `loading` — boolean
- `onEdit(user)` — callback
- `onDelete(user)` — callback

**Columns:**
| Kolom | Field | Keterangan |
|---|---|---|
| Nama | `user.name` | — |
| Email | `user.email` | — |
| Role | `user.labels` | Badge: "Admin" (biru) atau "Pegawai" (abu) |
| Terdaftar | `user.registration` | Format: tanggal relatif atau dd/mm/yyyy |
| Aksi | — | Tombol Edit + Hapus (icon buttons) |

**Empty state:** "Belum ada user terdaftar."
**Loading state:** Skeleton rows atau spinner

### `src/components/admin/UserFormModal.jsx`

**Props:**
- `open` — boolean
- `user` — user object (null = mode create)
- `onClose()` — callback
- `onSubmit({ name, email, password?, role })` — callback
- `submitting` — boolean

**Form fields:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| Nama Lengkap | text | Ya | — |
| Alamat Email | email | Ya | Disabled saat edit (email Appwrite tidak bisa diubah via function — akan diimplementasi update jika dibutuhkan) |
| Kata Sandi | password | Ya (create), Hidden (edit) | Min 8 karakter. Hanya tampil saat create. |
| Role | select | Ya | Options: "Pegawai PLN", "Admin" |

**Mode Create:**
- Title: `Tambah User Baru`
- Submit button: `Tambah User`

**Mode Edit:**
- Title: `Edit User`
- Submit button: `Simpan Perubahan`
- Email field: disabled
- Password field: hidden

**Validasi client-side:**
- Nama: required
- Email: required + format
- Password (create): required + min 8 char
- Role: required

### `src/components/admin/DeleteConfirmModal.jsx`

**Props:**
- `open` — boolean
- `user` — user object
- `onClose()` — callback
- `onConfirm()` — callback
- `deleting` — boolean

**Konten:**
- Icon: `AlertTriangle` dari lucide-react
- Heading: `Hapus User`
- Text: `Apakah Anda yakin ingin menghapus akun **{user.name}** ({user.email})? Tindakan ini tidak dapat dibatalkan.`
- Tombol Cancel: `Batal`
- Tombol Confirm: `Hapus User` (warna danger)

---

## Styling (Industrial Skeuomorphism)

### Admin Dashboard

- `.admin-dashboard` — page wrapper, same section/container pattern
- `.admin-header` — heading + subtitle
- `.admin-section` — card-like section (neumorphic shadow)
- `.admin-section-header` — flexbox: heading kiri, action button kanan
- `.admin-search` — recessed input field (sama seperti login input)

### User Table

- `.admin-table-wrapper` — overflow-x auto untuk mobile responsive
- `.admin-table` — width 100%, border-collapse separate
- `.admin-table th` — monospace uppercase label style (sama seperti login label)
- `.admin-table td` — padding, border-bottom subtle
- `.admin-table tr:hover` — background muted
- `.admin-role-badge` — pill badge, variant untuk admin (accent) dan pegawai (muted)
- `.admin-action-btn` — icon button, ghost style

### Modal

- `.modal-overlay` — fixed overlay, background semi-transparan, z-index tinggi
- `.modal-content` — centered card (neumorphic), max-width 28rem, slide-up animation
- `.modal-header` — heading + close button
- `.modal-body` — form fields (reuse login input styles)
- `.modal-footer` — action buttons (right-aligned)

### Pagination

- `.admin-pagination` — flexbox: info kiri, buttons kanan
- `.admin-pagination-info` — text muted
- `.admin-pagination-btn` — small button, disabled state

---

## Routing Update (App.jsx)

Perubahan:
```
/admin/dashboard → ProtectedRoute(adminOnly) → AdminDashboard (ganti UnderConstruction)
```

---

## Tidak Termasuk dalam Scope B2

- Dashboard user biasa / pegawai PLN (Phase C)
- Manajemen konten kontrak (Phase C)
- Form inspeksi (Phase D)
- Password reset (bisa ditambah nanti)
- User profile/avatar (bisa ditambah nanti)
- Bulk operations (import/export user)
- Audit log
