import { useAuth } from '../../context/AuthContext.jsx';

export default function UserManagement() {
  const { user } = useAuth();

  return (
    <div className="itp-dashboard">
      <h1 className="itp-dashboard-title">USER MANAGEMENT</h1>
      <div className="itp-section-card">
        <h2 className="itp-section-title">Informasi Akun</h2>
        <div className="itp-field-grid">
          <div className="itp-field">
            <span className="itp-field-label">Nama</span>
            <span className="itp-info-value">{user?.name || '-'}</span>
          </div>
          <div className="itp-field">
            <span className="itp-field-label">Email</span>
            <span className="itp-info-value">{user?.email || '-'}</span>
          </div>
          <div className="itp-field">
            <span className="itp-field-label">Role</span>
            <span className="itp-info-value">User</span>
          </div>
        </div>
        <p className="itp-placeholder-hint">
          Manajemen user lengkap hanya dapat dilakukan oleh admin.
        </p>
      </div>
    </div>
  );
}
