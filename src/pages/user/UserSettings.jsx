import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UserSettings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Replace with supabase.auth.updateUser({ data: { name } })
    window.alert('Pengaturan disimpan (dummy).');
  };

  return (
    <div className="itp-dashboard">
      <h1 className="itp-dashboard-title">SETTINGS</h1>
      <form className="itp-section-card" onSubmit={handleSubmit}>
        <h2 className="itp-section-title">Pengaturan Akun</h2>
        <div className="itp-field-grid">
          <div className="itp-field itp-field--full">
            <label className="itp-field-label" htmlFor="settings-name">Nama Lengkap</label>
            <input
              id="settings-name"
              className="itp-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="itp-field itp-field--full">
            <label className="itp-field-label" htmlFor="settings-email">Email</label>
            <input
              id="settings-email"
              className="itp-input"
              value={email}
              disabled
            />
          </div>
        </div>
        <div className="itp-actions-bar itp-actions-bar--inline">
          <button type="submit" className="itp-action-btn itp-action-btn--success">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
