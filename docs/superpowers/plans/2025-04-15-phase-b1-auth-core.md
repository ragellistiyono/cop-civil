# Sub-Phase B1: Auth Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Appwrite Cloud authentication into CIVIL QTRACK UPT Malang — login/logout, session management, protected routes, and navbar update.

**Architecture:** Appwrite Web SDK → AuthContext (React Context) → consumers (Login page, ProtectedRoute, UserMenu, Navbar). Role detection via Appwrite Labels (`admin` label). Public pages remain accessible without login.

**Tech Stack:** React 19, react-router-dom 7, appwrite (Web SDK), lucide-react, CSS custom properties (Industrial Skeuomorphism theme).

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `.env.example` | Template for environment variables (committed) |
| `src/lib/appwrite.js` | Appwrite Client + Account instance configuration |
| `src/context/AuthContext.jsx` | Auth state management: user, login, logout, isAdmin, loading |
| `src/components/ProtectedRoute.jsx` | Route guard: redirect to /login if not authenticated |
| `src/components/UserMenu.jsx` | Navbar dropdown: user name, dashboard link, logout |
| `src/pages/Login.jsx` | Login form page with email/password |
| `src/pages/AccessDenied.jsx` | "Access Denied" error page |

### Modified Files

| File | Change |
|---|---|
| `package.json` | Add `appwrite` dependency (via npm install) |
| `src/App.jsx` | Wrap with AuthProvider, add new routes |
| `src/components/Navbar.jsx` | Replace "Masuk" button with conditional UserMenu/login link |
| `src/styles/components.css` | Add login, user-menu, access-denied, loading CSS |
| `src/styles/layouts.css` | Add login page layout + responsive rules |

---

### Task 1: Install Appwrite SDK & Environment Setup

**Files:**
- Create: `.env.example`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install Appwrite Web SDK**

Run: `npm install appwrite`

Expected: `appwrite` added to `dependencies` in `package.json`.

- [ ] **Step 2: Create .env.example**

Create `.env.example`:

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id-here
```

- [ ] **Step 3: Verify .env is in .gitignore**

Run: `grep -c "^\.env$" .gitignore`

Expected: `1` (already present)

- [ ] **Step 4: Commit**

```bash
git add .env.example package.json package-lock.json
git commit -m "feat: install appwrite SDK and add env template"
```

---

### Task 2: Appwrite Client Configuration

**Files:**
- Create: `src/lib/appwrite.js`

- [ ] **Step 1: Create the Appwrite client module**

Create `src/lib/appwrite.js`:

```javascript
import { Client, Account, ID } from 'appwrite';

const client = new Client();

if (import.meta.env.VITE_APPWRITE_ENDPOINT && import.meta.env.VITE_APPWRITE_PROJECT_ID) {
  client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
}

const account = new Account(client);

export { client, account, ID };
```

The conditional check prevents crashes if env vars are missing (e.g. in CI or first-time setup). Operations will fail at API call time with a descriptive Appwrite error instead of a cryptic boot crash.

- [ ] **Step 2: Commit**

```bash
git add src/lib/appwrite.js
git commit -m "feat: add Appwrite client configuration"
```

---

### Task 3: AuthContext Provider

**Files:**
- Create: `src/context/AuthContext.jsx`

- [ ] **Step 1: Create AuthContext**

Create `src/context/AuthContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { account } from '../lib/appwrite.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account.get()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    await account.createEmailPasswordSession({ email, password });
    const currentUser = await account.get();
    setUser(currentUser);
    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    await account.deleteSession({ sessionId: 'current' });
    setUser(null);
  }, []);

  const isAdmin = useMemo(() => user?.labels?.includes('admin') ?? false, [user]);
  const isAuthenticated = user !== null;

  const value = useMemo(
    () => ({ user, loading, login, logout, isAdmin, isAuthenticated }),
    [user, loading, login, logout, isAdmin, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/AuthContext.jsx
git commit -m "feat: add AuthContext for session management"
```

---

### Task 4: ProtectedRoute Component

**Files:**
- Create: `src/components/ProtectedRoute.jsx`

- [ ] **Step 1: Create ProtectedRoute**

Create `src/components/ProtectedRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Memuat...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProtectedRoute.jsx
git commit -m "feat: add ProtectedRoute component"
```

---

### Task 5: Login Page

**Files:**
- Create: `src/pages/Login.jsx`

- [ ] **Step 1: Create Login page**

Create `src/pages/Login.jsx`:

```jsx
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Memuat...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Silakan isi alamat email dan kata sandi.');
      return;
    }

    setSubmitting(true);
    try {
      const currentUser = await login(email, password);
      const isAdminUser = currentUser?.labels?.includes('admin') ?? false;
      navigate(isAdminUser ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (err) {
      setError(
        err?.message === 'Invalid credentials. Please check the email and password.'
          ? 'Email atau kata sandi tidak valid. Silakan coba kembali.'
          : 'Terjadi kesalahan. Silakan coba kembali.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section login-section">
      <div className="container">
        <div className="login-card card">
          <div className="login-header">
            <h1 className="login-title">Masuk ke CIVIL QTRACK</h1>
            <p className="login-subtitle">
              Sistem Manajemen Inspeksi Pekerjaan Sipil<br />
              PT PLN (Persero) UPT Malang
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">Alamat Email</label>
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="nama@pln.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={submitting}
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password" className="login-label">Kata Sandi</label>
              <input
                id="login-password"
                type="password"
                className="login-input"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                <AlertCircle size={16} strokeWidth={2.5} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader size={18} strokeWidth={2.5} className="spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn size={18} strokeWidth={2.5} />
                  Masuk
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Login.jsx
git commit -m "feat: add Login page with form and error handling"
```

---

### Task 6: AccessDenied Page

**Files:**
- Create: `src/pages/AccessDenied.jsx`

- [ ] **Step 1: Create AccessDenied page**

Create `src/pages/AccessDenied.jsx`:

```jsx
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="access-denied">
      <div className="access-denied-icon" aria-hidden="true">
        <ShieldAlert size={64} strokeWidth={1.5} />
      </div>
      <h2>Akses Ditolak</h2>
      <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={18} strokeWidth={2.5} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/AccessDenied.jsx
git commit -m "feat: add AccessDenied page"
```

---

### Task 7: UserMenu Component

**Files:**
- Create: `src/components/UserMenu.jsx`

- [ ] **Step 1: Create UserMenu**

Create `src/components/UserMenu.jsx`:

```jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || user?.email || 'User';

  const handleDashboard = () => {
    setOpen(false);
    navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Menu pengguna"
      >
        <span className="user-menu-avatar">
          <User size={16} strokeWidth={2.5} />
        </span>
        <span className="user-menu-name">{displayName}</span>
        <ChevronDown size={14} strokeWidth={2.5} className={`user-menu-chevron${open ? ' open' : ''}`} />
      </button>

      <div className={`user-menu-dropdown${open ? ' open' : ''}`} role="menu">
        <button className="user-menu-item" role="menuitem" onClick={handleDashboard}>
          <LayoutDashboard size={16} strokeWidth={2} />
          Dashboard
        </button>
        <div className="user-menu-divider" />
        <button className="user-menu-item user-menu-item--logout" role="menuitem" onClick={handleLogout}>
          <LogOut size={16} strokeWidth={2} />
          Keluar
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/UserMenu.jsx
git commit -m "feat: add UserMenu dropdown component"
```

---

### Task 8: CSS Styles for Auth Components

**Files:**
- Modify: `src/styles/components.css` (append after last rule)
- Modify: `src/styles/layouts.css` (add login layout before `@media (min-width: 768px)` block, add responsive rules inside that block)

- [ ] **Step 1: Add auth component styles to components.css**

Open `src/styles/components.css`. Append the following CSS **after** the last rule (`.kontrak-dokumen-heading`):

```css
/* --- Login Page --- */
.login-card {
  max-width: 28rem;
  margin: 0 auto;
  padding: 2.5rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: var(--color-secondary);
  font-size: 0.85rem;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.login-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.login-input {
  padding: 0.85rem 1rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-fg);
  background-color: var(--color-bg);
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-recessed);
  outline: none;
  transition: box-shadow var(--transition-speed);
  min-height: 48px;
}

.login-input::placeholder {
  color: var(--color-secondary);
  opacity: 0.5;
}

.login-input:focus {
  box-shadow: var(--shadow-recessed), 0 0 0 2px var(--color-accent);
}

.login-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #dc2626;
  background-color: rgba(220, 38, 38, 0.08);
  border-radius: var(--radius-sm);
}

.login-error svg {
  flex-shrink: 0;
  display: inline;
}

.login-submit {
  width: 100%;
  margin-top: 0.5rem;
}

/* --- Spinner Animation --- */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* --- User Menu --- */
.user-menu {
  position: relative;
}

.user-menu-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background-color: var(--color-bg);
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-fg);
  transition: all var(--transition-speed) var(--transition-easing);
  min-height: 40px;
}

.user-menu-btn:hover {
  box-shadow: var(--shadow-md);
}

.user-menu-btn:active {
  box-shadow: var(--shadow-active);
}

.user-menu-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-circle);
  background-color: var(--color-accent);
  color: var(--color-white);
}

.user-menu-avatar svg {
  display: inline;
}

.user-menu-name {
  max-width: 10rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu-chevron {
  transition: transform 200ms;
  display: inline;
}

.user-menu-chevron.open {
  transform: rotate(180deg);
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 12rem;
  padding: 0.5rem;
  background-color: var(--color-card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: all 200ms ease-out;
  z-index: 200;
}

.user-menu-dropdown.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-fg);
  text-align: left;
  transition: background-color 150ms;
}

.user-menu-item svg {
  display: inline;
  color: var(--color-secondary);
}

.user-menu-item:hover {
  background-color: var(--color-muted);
}

.user-menu-item--logout:hover {
  color: #dc2626;
}

.user-menu-item--logout:hover svg {
  color: #dc2626;
}

.user-menu-divider {
  height: 1px;
  margin: 0.35rem 0;
  background-color: var(--color-border);
}

/* --- Access Denied --- */
.access-denied {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
  gap: 1.5rem;
}

.access-denied-icon {
  color: var(--color-accent);
}

.access-denied h2 {
  font-family: var(--font-heading);
}

.access-denied p {
  opacity: 0.7;
  max-width: 40ch;
}

/* --- Auth Loading --- */
.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  color: var(--color-secondary);
}

.auth-loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--color-muted);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

- [ ] **Step 2: Add login layout to layouts.css**

Open `src/styles/layouts.css`. Insert the following CSS **before** the existing `@media (min-width: 768px)` block:

```css
/* --- Login Page Layout --- */
.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4rem);
}
```

Then, **inside** the existing `@media (min-width: 768px)` block, add:

```css
  .user-menu-btn {
    display: inline-flex;
  }
```

Also, the `.navbar-login` rule already exists in the 768px block (`display: inline-flex`). This will need to be kept for the login button styling, but the Navbar JSX will conditionally render either UserMenu or the login link.

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/components.css src/styles/layouts.css
git commit -m "feat: add CSS styles for auth components"
```

---

### Task 9: Update App.jsx — AuthProvider + Routes

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Update App.jsx**

Read `src/App.jsx` first. Then make these changes:

1. Add new imports after existing imports:

```javascript
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';
```

2. Add new routes inside `<Routes>`:

```jsx
<Route path="/login" element={<Login />} />
<Route path="/access-denied" element={<AccessDenied />} />
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <UnderConstruction title="Dashboard" />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute adminOnly>
      <UnderConstruction title="Admin Dashboard" />
    </ProtectedRoute>
  }
/>
```

3. In the `App` component, wrap `<AppLayout />` with `<AuthProvider>`. The structure should be:

```jsx
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
git commit -m "feat: add AuthProvider and protected routes to App"
```

---

### Task 10: Update Navbar — Login Link & UserMenu

**Files:**
- Modify: `src/components/Navbar.jsx`

- [ ] **Step 1: Update Navbar.jsx**

Read `src/components/Navbar.jsx` first. Then make these changes:

1. Add imports:

```javascript
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import UserMenu from './UserMenu';
```

(Replace the existing `import { Link } from 'react-router-dom';` line)

2. Remove the unused `Zap` import from lucide-react (it's imported but never used in the component).

3. Inside the `Navbar` component function, add auth hook:

```javascript
const { isAuthenticated, loading } = useAuth();
```

4. Replace the "Masuk" button with conditional rendering. Change:

```jsx
<button className="btn btn-primary navbar-login" aria-label="Masuk ke akun">
  Masuk
</button>
```

To:

```jsx
{!loading && (
  isAuthenticated ? (
    <div className="navbar-login">
      <UserMenu />
    </div>
  ) : (
    <Link to="/login" className="btn btn-primary navbar-login" aria-label="Masuk ke akun">
      Masuk
    </Link>
  )
)}
```

Note: The `navbar-login` class is already styled to `display: none` on mobile and `display: inline-flex` on desktop (768px+). The `<div>` wrapper for UserMenu uses the same class to inherit this visibility behavior.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.jsx
git commit -m "feat: update Navbar with login link and UserMenu"
```

---

### Task 11: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run final build**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run dev server and verify**

Run: `npm run dev`

Verify the following in the browser:

1. **Public pages work without login:** `/`, `/kontrak`, `/kontrak/002-pj-2025` all accessible
2. **Navbar shows "Masuk" button** when not logged in (desktop only)
3. **Click "Masuk"** → navigates to `/login`
4. **Login page** shows "Masuk ke CIVIL QTRACK" heading with email/password form
5. **Login page styling** follows Industrial Skeuomorphism (recessed inputs, neumorphic card)
6. **Empty form submit** shows "Silakan isi alamat email dan kata sandi." error
7. **Wrong credentials** shows "Email atau kata sandi tidak valid." error (requires Appwrite project to be set up)
8. **Navigate to `/dashboard`** without login → redirects to `/login`
9. **Navigate to `/admin/dashboard`** without login → redirects to `/login`
10. **Navigate to `/access-denied`** → shows "Akses Ditolak" page

Note: Full login flow testing requires Appwrite Cloud project to be configured with `.env` file. Steps 7+ can be deferred until the user completes the Appwrite prerequisites.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Sub-Phase B1 — Auth Core with Appwrite"
```

---

## Summary

| Task | What it does | Files |
|---|---|---|
| 1 | Install Appwrite SDK + env template | `package.json`, `.env.example` |
| 2 | Appwrite Client config | `src/lib/appwrite.js` |
| 3 | AuthContext provider | `src/context/AuthContext.jsx` |
| 4 | ProtectedRoute guard | `src/components/ProtectedRoute.jsx` |
| 5 | Login page | `src/pages/Login.jsx` |
| 6 | AccessDenied page | `src/pages/AccessDenied.jsx` |
| 7 | UserMenu dropdown | `src/components/UserMenu.jsx` |
| 8 | CSS styles | `src/styles/components.css`, `src/styles/layouts.css` |
| 9 | App.jsx — AuthProvider + routes | `src/App.jsx` |
| 10 | Navbar — login link + UserMenu | `src/components/Navbar.jsx` |
| 11 | Final verification | — |
