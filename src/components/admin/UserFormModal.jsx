import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserFormModal({ open, user, onClose, onSubmit, submitting, externalError = '' }) {
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
    <div className="modal-overlay" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal-content card" role="dialog" aria-modal="true" aria-labelledby="user-form-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="user-form-title" className="modal-title">{isEdit ? 'Edit User' : 'Tambah User Baru'}</h2>
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

          {(error || externalError) && (
            <div className="login-error" role="alert">
              <AlertCircle size={16} strokeWidth={2.5} />
              <span>{error || externalError}</span>
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
