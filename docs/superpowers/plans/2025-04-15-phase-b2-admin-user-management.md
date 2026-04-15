# Sub-Phase B2: Admin User Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin CRUD user management — Cloud Function + admin dashboard UI.

**Tech Stack:** React 19, react-router-dom 7, appwrite (Web SDK), node-appwrite (Server SDK in Cloud Function), lucide-react, CSS custom properties (Industrial Skeuomorphism theme).

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `functions/manage-users/package.json` | Cloud Function dependencies |
| `functions/manage-users/src/main.js` | Cloud Function entry point — REST-like router for user CRUD |
| `src/hooks/useUsers.js` | Custom hook — invoke Cloud Function, manage user list state |
| `src/pages/AdminDashboard.jsx` | Admin dashboard page with user management section |
| `src/components/admin/UserTable.jsx` | User list table with role badges and action buttons |
| `src/components/admin/UserFormModal.jsx` | Modal for creating/editing users |
| `src/components/admin/DeleteConfirmModal.jsx` | Confirmation modal for user deletion |

### Modified Files

| File | Change |
|---|---|
| `.env.example` | Add `VITE_APPWRITE_FUNCTION_MANAGE_USERS` |
| `src/lib/appwrite.js` | Add `Functions` import and export |
| `src/App.jsx` | Replace admin dashboard placeholder with `AdminDashboard` |
| `src/styles/components.css` | Add admin dashboard, table, modal, badge CSS |
| `src/styles/layouts.css` | Add admin layout + responsive rules |

---

### Task 1: Cloud Function — manage-users

**Files:**
- Create: `functions/manage-users/package.json`
- Create: `functions/manage-users/src/main.js`

- [ ] **Step 1: Create package.json**

Create `functions/manage-users/package.json`:

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

- [ ] **Step 2: Create main.js**

Create `functions/manage-users/src/main.js`:

```javascript
import { Client, Users, ID, Query } from 'node-appwrite';

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

function extractPathId(path) {
  const match = path.match(/^\/users\/([^/]+)$/);
  return match ? match[1] : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleListUsers(users, req) {
  const search = req.query?.search || '';
  const limit = Math.min(parseInt(req.query?.limit) || 25, 100);
  const offset = parseInt(req.query?.offset) || 0;

  const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')];
  if (search) queries.push(Query.search('name', search));

  const result = await users.list(queries);
  return {
    total: result.total,
    users: result.users.map((u) => ({
      $id: u.$id,
      name: u.name,
      email: u.email,
      labels: u.labels,
      status: u.status,
      registration: u.registration,
    })),
  };
}

async function handleCreateUser(users, req) {
  const { name, email, password, role } = parseBody(req);

  if (!name || !name.trim()) return { _status: 400, error: 'Nama wajib diisi.' };
  if (!email || !EMAIL_RE.test(email)) return { _status: 400, error: 'Format email tidak valid.' };
  if (!password || password.length < 8)
    return { _status: 400, error: 'Kata sandi harus minimal 8 karakter.' };
  if (!['admin', 'user'].includes(role))
    return { _status: 400, error: 'Role harus admin atau user.' };

  const user = await users.create(ID.unique(), email, undefined, password, name.trim());

  if (role === 'admin') {
    await users.updateLabels(user.$id, ['admin']);
  }

  const final = await users.get(user.$id);
  return {
    $id: final.$id,
    name: final.name,
    email: final.email,
    labels: final.labels,
    status: final.status,
    registration: final.registration,
  };
}

async function handleUpdateUser(users, userId, req) {
  const { name, role } = parseBody(req);

  let existing;
  try {
    existing = await users.get(userId);
  } catch {
    return { _status: 404, error: 'User tidak ditemukan.' };
  }

  if (name !== undefined && name.trim()) {
    await users.updateName(userId, name.trim());
  }

  if (role !== undefined) {
    if (!['admin', 'user'].includes(role))
      return { _status: 400, error: 'Role harus admin atau user.' };
    await users.updateLabels(userId, role === 'admin' ? ['admin'] : []);
  }

  const updated = await users.get(userId);
  return {
    $id: updated.$id,
    name: updated.name,
    email: updated.email,
    labels: updated.labels,
    status: updated.status,
    registration: updated.registration,
  };
}

async function handleDeleteUser(users, userId, req) {
  const callerId = req.headers['x-appwrite-user-id'];
  if (callerId === userId) {
    return { _status: 403, error: 'Tidak dapat menghapus akun sendiri.' };
  }

  try {
    await users.get(userId);
  } catch {
    return { _status: 404, error: 'User tidak ditemukan.' };
  }

  await users.delete(userId);
  return { success: true };
}

export default async ({ req, res, log, error }) => {
  try {
    const client = initClient();
    const users = new Users(client);

    const method = req.method;
    const path = req.path || '/';
    const userId = extractPathId(path);

    let result;

    if (path === '/users' && method === 'GET') {
      result = await handleListUsers(users, req);
    } else if (path === '/users' && method === 'POST') {
      result = await handleCreateUser(users, req);
    } else if (userId && method === 'PATCH') {
      result = await handleUpdateUser(users, userId, req);
    } else if (userId && method === 'DELETE') {
      result = await handleDeleteUser(users, userId, req);
    } else {
      return res.json({ error: 'Route tidak ditemukan.' }, 404);
    }

    const status = result._status || 200;
    if (result._status) delete result._status;
    return res.json(result, status);
  } catch (err) {
    error('Function error: ' + err.message);

    if (err.code === 409) {
      return res.json({ error: 'Email sudah terdaftar.' }, 409);
    }

    return res.json({ error: err.message || 'Terjadi kesalahan server.' }, 500);
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add functions/
git commit -m "feat: add manage-users Cloud Function for admin CRUD"
```

---

### Task 2: Environment & Appwrite Client Update

**Files:**
- Modify: `.env.example`
- Modify: `src/lib/appwrite.js`

- [ ] **Step 1: Update .env.example**

Append to `.env.example`:

```
VITE_APPWRITE_FUNCTION_MANAGE_USERS=your-function-id-here
```

- [ ] **Step 2: Update appwrite.js**

Open `src/lib/appwrite.js`. Change:

```javascript
import { Client, Account, ID } from 'appwrite';
```

To:

```javascript
import { Client, Account, Functions, ID } from 'appwrite';
```

Then before the export line, add:

```javascript
const functions = new Functions(client);
```

Then update the export:

```javascript
export { client, account, functions, ID };
```

- [ ] **Step 3: Commit**

```bash
git add .env.example src/lib/appwrite.js
git commit -m "feat: add Functions SDK export and manage-users env var"
```

---

### Task 3: useUsers Hook

**Files:**
- Create: `src/hooks/useUsers.js`

- [ ] **Step 1: Create useUsers.js**

Create `src/hooks/useUsers.js`:

```javascript
import { useState, useCallback } from 'react';
import { functions } from '../lib/appwrite.js';

const FUNCTION_ID = import.meta.env.VITE_APPWRITE_FUNCTION_MANAGE_USERS;

async function callManageUsers(method, path, body = null) {
  const params = {
    functionId: FUNCTION_ID,
    method,
    xpath: path,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) params.body = JSON.stringify(body);

  const execution = await functions.createExecution(params);
  const response = JSON.parse(execution.responseBody);

  if (execution.responseStatusCode >= 400) {
    throw new Error(response.error || 'Terjadi kesalahan.');
  }
  return response;
}

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (search = '', limit = 25, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      const qs = params.toString();
      const result = await callManageUsers('GET', `/users?${qs}`);
      setUsers(result.users);
      setTotal(result.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data) => {
    const result = await callManageUsers('POST', '/users', data);
    return result;
  }, []);

  const updateUser = useCallback(async (id, data) => {
    const result = await callManageUsers('PATCH', `/users/${id}`, data);
    return result;
  }, []);

  const deleteUser = useCallback(async (id) => {
    const result = await callManageUsers('DELETE', `/users/${id}`);
    return result;
  }, []);

  return { users, total, loading, error, fetchUsers, createUser, updateUser, deleteUser };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useUsers.js
git commit -m "feat: add useUsers hook for Cloud Function CRUD"
```

---

### Task 4: UserTable Component

**Files:**
- Create: `src/components/admin/UserTable.jsx`

- [ ] **Step 1: Create UserTable.jsx**

Create directory `src/components/admin/` then create `src/components/admin/UserTable.jsx`:

```jsx
import { Pencil, Trash2 } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function RoleBadge({ labels }) {
  const isAdmin = labels?.includes('admin');
  return (
    <span className={`admin-role-badge ${isAdmin ? 'admin-role-badge--admin' : 'admin-role-badge--user'}`}>
      {isAdmin ? 'Admin' : 'Pegawai'}
    </span>
  );
}

export default function UserTable({ users, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="admin-table-loading">
        <div className="auth-loading-spinner" />
        <p>Memuat data user...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="admin-table-empty">
        <p>Belum ada user terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Terdaftar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.$id}>
              <td className="admin-table-name">{user.name || '-'}</td>
              <td className="admin-table-email">{user.email}</td>
              <td><RoleBadge labels={user.labels} /></td>
              <td className="admin-table-date">{formatDate(user.registration)}</td>
              <td className="admin-table-actions">
                <button
                  className="admin-action-btn"
                  onClick={() => onEdit(user)}
                  aria-label={`Edit ${user.name}`}
                >
                  <Pencil size={16} strokeWidth={2} />
                </button>
                <button
                  className="admin-action-btn admin-action-btn--danger"
                  onClick={() => onDelete(user)}
                  aria-label={`Hapus ${user.name}`}
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
git add src/components/admin/UserTable.jsx
git commit -m "feat: add UserTable component for admin dashboard"
```

---

### Task 5: UserFormModal Component

**Files:**
- Create: `src/components/admin/UserFormModal.jsx`

- [ ] **Step 1: Create UserFormModal.jsx**

Create `src/components/admin/UserFormModal.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserFormModal({ open, user, onClose, onSubmit, submitting }) {
  const isEdit = user !== null;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setRole(user.labels?.includes('admin') ? 'admin' : 'user');
      } else {
        setName('');
        setEmail('');
        setRole('user');
      }
      setPassword('');
      setError('');
    }
  }, [open, user]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Nama wajib diisi.'); return; }
    if (!isEdit && (!email || !EMAIL_RE.test(email))) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }
    if (!isEdit && (!password || password.length < 8)) {
      setError('Kata sandi harus minimal 8 karakter.');
      return;
    }

    const data = { name: name.trim(), role };
    if (!isEdit) {
      data.email = email;
      data.password = password;
    }
    onSubmit(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit User' : 'Tambah User Baru'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="user-name" className="login-label">Nama Lengkap</label>
            <input
              id="user-name"
              type="text"
              className="login-input"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          {!isEdit && (
            <div className="login-field">
              <label htmlFor="user-email" className="login-label">Alamat Email</label>
              <input
                id="user-email"
                type="email"
                className="login-input"
                placeholder="nama@pln.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          )}

          {isEdit && (
            <div className="login-field">
              <label className="login-label">Alamat Email</label>
              <input
                type="email"
                className="login-input"
                value={email}
                disabled
              />
            </div>
          )}

          {!isEdit && (
            <div className="login-field">
              <label htmlFor="user-password" className="login-label">Kata Sandi</label>
              <input
                id="user-password"
                type="password"
                className="login-input"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          )}

          <div className="login-field">
            <label htmlFor="user-role" className="login-label">Role</label>
            <select
              id="user-role"
              className="login-input admin-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={submitting}
            >
              <option value="user">Pegawai PLN</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <AlertCircle size={16} strokeWidth={2.5} />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn modal-btn-cancel" onClick={onClose} disabled={submitting}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? 'Memproses...'
                : isEdit ? 'Simpan Perubahan' : 'Tambah User'}
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
git add src/components/admin/UserFormModal.jsx
git commit -m "feat: add UserFormModal for create/edit user"
```

---

### Task 6: DeleteConfirmModal Component

**Files:**
- Create: `src/components/admin/DeleteConfirmModal.jsx`

- [ ] **Step 1: Create DeleteConfirmModal.jsx**

Create `src/components/admin/DeleteConfirmModal.jsx`:

```jsx
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ open, user, onClose, onConfirm, deleting }) {
  if (!open || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Hapus User</h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="modal-body delete-confirm-body">
          <div className="delete-confirm-icon" aria-hidden="true">
            <AlertTriangle size={48} strokeWidth={1.5} />
          </div>
          <p>
            Apakah Anda yakin ingin menghapus akun <strong>{user.name || user.email}</strong>
            {user.name ? ` (${user.email})` : ''}? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn modal-btn-cancel" onClick={onClose} disabled={deleting}>
            Batal
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Menghapus...' : 'Hapus User'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/DeleteConfirmModal.jsx
git commit -m "feat: add DeleteConfirmModal for user deletion"
```

---

### Task 7: AdminDashboard Page

**Files:**
- Create: `src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Create AdminDashboard.jsx**

Create `src/pages/AdminDashboard.jsx`:

```jsx
import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, AlertCircle } from 'lucide-react';
import { useUsers } from '../hooks/useUsers.js';
import UserTable from '../components/admin/UserTable';
import UserFormModal from '../components/admin/UserFormModal';
import DeleteConfirmModal from '../components/admin/DeleteConfirmModal';

const PAGE_SIZE = 10;

export default function AdminDashboard() {
  const { users, total, loading, error, fetchUsers, createUser, updateUser, deleteUser } = useUsers();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const offset = (page - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const refresh = useCallback(() => {
    fetchUsers(search, PAGE_SIZE, offset);
  }, [fetchUsers, search, offset]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async (data) => {
    setFormSubmitting(true);
    setFormError('');
    try {
      await createUser(data);
      setShowCreateModal(false);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!editingUser) return;
    setFormSubmitting(true);
    setFormError('');
    try {
      await updateUser(editingUser.$id, data);
      setEditingUser(null);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setFormSubmitting(true);
    try {
      await deleteUser(deletingUser.$id);
      setDeletingUser(null);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <section className="section admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Dashboard Admin</h1>
          <p className="admin-subtitle">Manajemen Sistem CIVIL QTRACK UPT Malang</p>
        </div>

        <div className="admin-section card">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Manajemen User</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="login-error" role="alert" style={{ margin: '0 0 1rem' }}>
              <AlertCircle size={16} strokeWidth={2.5} />
              <span>{error}</span>
            </div>
          )}

          <UserTable
            users={users}
            loading={loading}
            onEdit={setEditingUser}
            onDelete={setDeletingUser}
          />

          {totalPages > 1 && (
            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Menampilkan {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} dari {total} user
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
      </div>

      <UserFormModal
        open={showCreateModal}
        user={null}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        submitting={formSubmitting}
      />

      <UserFormModal
        open={editingUser !== null}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdate}
        submitting={formSubmitting}
      />

      <DeleteConfirmModal
        open={deletingUser !== null}
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        deleting={formSubmitting}
      />
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/AdminDashboard.jsx
git commit -m "feat: add AdminDashboard page with user management"
```

---

### Task 8: CSS Styles for Admin Components

**Files:**
- Modify: `src/styles/components.css` (append after `.auth-loading-spinner`)
- Modify: `src/styles/layouts.css` (add responsive rules)

- [ ] **Step 1: Append admin styles to components.css**

Open `src/styles/components.css`. Append the following CSS **after** the `.auth-loading-spinner` rule (last rule in file):

```css
/* --- Admin Dashboard --- */
.admin-header {
  margin-bottom: 2rem;
}

.admin-header h1 {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-bottom: 0.25rem;
}

.admin-subtitle {
  color: var(--color-secondary);
  font-size: 0.9rem;
}

.admin-section {
  padding: 1.5rem;
}

.admin-section:hover {
  transform: none;
  box-shadow: var(--shadow-md);
}

.admin-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.admin-section-title {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.25rem;
}

.admin-search-row {
  margin-bottom: 1.25rem;
}

.admin-search-field {
  position: relative;
  max-width: 24rem;
}

.admin-search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-secondary);
  pointer-events: none;
  display: inline;
}

.admin-search-input {
  padding-left: 2.75rem !important;
}

/* --- Admin Table --- */
.admin-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.admin-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
}

.admin-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-secondary);
  border-bottom: 1px solid var(--color-border);
}

.admin-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.admin-table tbody tr {
  transition: background-color 150ms;
}

.admin-table tbody tr:hover {
  background-color: var(--color-muted);
}

.admin-table-name {
  font-weight: 600;
}

.admin-table-email {
  color: var(--color-secondary);
}

.admin-table-date {
  color: var(--color-secondary);
  font-size: 0.8rem;
  white-space: nowrap;
}

.admin-table-actions {
  display: flex;
  gap: 0.5rem;
}

.admin-table-loading,
.admin-table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
  color: var(--color-secondary);
}

/* --- Role Badge --- */
.admin-role-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.admin-role-badge--admin {
  background-color: var(--color-accent);
  color: var(--color-white);
}

.admin-role-badge--user {
  background-color: var(--color-muted);
  color: var(--color-secondary);
}

/* --- Action Button --- */
.admin-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-secondary);
  transition: all 150ms;
}

.admin-action-btn svg {
  display: inline;
}

.admin-action-btn:hover {
  background-color: var(--color-muted);
  color: var(--color-fg);
}

.admin-action-btn--danger:hover {
  color: var(--color-danger);
}

/* --- Admin Pagination --- */
.admin-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.admin-pagination-info {
  font-size: 0.8rem;
  color: var(--color-secondary);
}

.admin-pagination-buttons {
  display: flex;
  gap: 0.5rem;
}

.admin-pagination-btn {
  font-size: 0.8rem;
  padding: 0.45rem 0.9rem;
}

.admin-pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* --- Modal --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 150ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.75rem;
  animation: slideUp 200ms ease-out;
}

.modal-content:hover {
  transform: none;
  box-shadow: var(--shadow-lg);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.25rem;
}

.modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-secondary);
  transition: all 150ms;
}

.modal-close svg {
  display: inline;
}

.modal-close:hover {
  background-color: var(--color-muted);
  color: var(--color-fg);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.modal-btn-cancel {
  background-color: var(--color-muted);
  color: var(--color-fg);
}

.modal-btn-cancel:hover {
  background-color: var(--color-border);
}

/* --- Danger Button --- */
.btn-danger {
  background-color: var(--color-danger);
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.btn-danger:hover {
  opacity: 0.9;
  box-shadow: var(--shadow-md);
}

/* --- Delete Confirm --- */
.delete-confirm-body {
  text-align: center;
  align-items: center;
}

.delete-confirm-icon {
  color: var(--color-danger);
  margin-bottom: 0.5rem;
}

.delete-confirm-body p {
  font-size: 0.9rem;
  color: var(--color-secondary);
  line-height: 1.6;
}

/* --- Select Input --- */
.admin-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
  cursor: pointer;
}
```

- [ ] **Step 2: Add responsive rules to layouts.css**

Open `src/styles/layouts.css`.

**Inside the existing `@media (min-width: 768px)` block**, add after `.user-menu-btn { display: inline-flex; }`:

```css
  .admin-section {
    padding: 2rem;
  }

  .admin-table-name,
  .admin-table-email {
    max-width: none;
  }
```

**Inside the existing `@media (min-width: 1024px)` block**, add after `.kontrak-grid`:

```css
  .admin-section {
    padding: 2.5rem;
  }
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/styles/components.css src/styles/layouts.css
git commit -m "feat: add CSS styles for admin dashboard, table, modal"
```

---

### Task 9: Update App.jsx — Replace Placeholder

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Update App.jsx**

Read `src/App.jsx` first. Then:

1. Add import:

```javascript
import AdminDashboard from './pages/AdminDashboard';
```

2. Replace the admin dashboard route. Change:

```jsx
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute adminOnly>
      <UnderConstruction title="Admin Dashboard" />
    </ProtectedRoute>
  }
/>
```

To:

```jsx
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire AdminDashboard to /admin/dashboard route"
```

---

### Task 10: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run final build**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify file structure**

Run: `find functions/ src/components/admin/ src/hooks/useUsers.js src/pages/AdminDashboard.jsx -type f`

Expected files:
```
functions/manage-users/package.json
functions/manage-users/src/main.js
src/components/admin/UserTable.jsx
src/components/admin/UserFormModal.jsx
src/components/admin/DeleteConfirmModal.jsx
src/hooks/useUsers.js
src/pages/AdminDashboard.jsx
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Sub-Phase B2 — Admin User Management"
```

---

## Deployment Instructions (for user)

After implementation, to make the admin dashboard fully functional:

1. **Install Appwrite CLI:**
   ```bash
   npm install -g appwrite-cli
   appwrite login
   ```

2. **Create the function** via Appwrite Console:
   - Name: `manage-users`
   - Runtime: Node.js 18.0
   - Entrypoint: `src/main.js`
   - Execute permissions: `label:admin`

3. **Create API Key** in Appwrite Console:
   - Scopes: `users.read`, `users.write`
   - Copy the key value

4. **Set function environment variable:**
   - Key: `APPWRITE_API_KEY`
   - Value: (paste API key)

5. **Deploy function code:**
   - Upload `functions/manage-users/` folder via Console or CLI:
   ```bash
   cd functions/manage-users && appwrite functions createDeployment \
     --functionId=<FUNCTION_ID> \
     --entrypoint="src/main.js" \
     --code="." \
     --activate=true
   ```

6. **Update `.env`:**
   ```
   VITE_APPWRITE_FUNCTION_MANAGE_USERS=<function-id>
   ```

---

## Summary

| Task | What it does | Files |
|---|---|---|
| 1 | Cloud Function manage-users | `functions/manage-users/*` |
| 2 | Env var + Functions SDK export | `.env.example`, `src/lib/appwrite.js` |
| 3 | useUsers hook | `src/hooks/useUsers.js` |
| 4 | UserTable component | `src/components/admin/UserTable.jsx` |
| 5 | UserFormModal component | `src/components/admin/UserFormModal.jsx` |
| 6 | DeleteConfirmModal component | `src/components/admin/DeleteConfirmModal.jsx` |
| 7 | AdminDashboard page | `src/pages/AdminDashboard.jsx` |
| 8 | CSS styles | `src/styles/components.css`, `src/styles/layouts.css` |
| 9 | App.jsx route update | `src/App.jsx` |
| 10 | Final verification | — |
