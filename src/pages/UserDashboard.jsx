import { Link } from 'react-router-dom';
import { ClipboardList, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <section className="section user-dashboard">
      <div className="container">
        <div className="user-dashboard-header">
          <h1>Dashboard</h1>
          <p className="user-dashboard-welcome">
            Selamat datang, {user?.name || 'Pengguna'}
          </p>
        </div>

        <div className="dashboard-cards-grid">
          {/* Card 1: Inspeksi — Coming Soon */}
          <div className="card dashboard-card dashboard-card--disabled" aria-disabled="true">
            <div className="dashboard-card-icon">
              <ClipboardList size={24} strokeWidth={2} />
            </div>
            <h2 className="dashboard-card-title">
              Inspeksi CIVIL QTRACK
              <span className="dashboard-card-badge">Segera Hadir</span>
            </h2>
            <p className="dashboard-card-desc">
              Form inspeksi dan hasil pemeriksaan pekerjaan sipil secara digital.
            </p>
          </div>

          {/* Card 2: Dokumen Kontrak */}
          <Link to="/kontrak" className="card dashboard-card">
            <div className="dashboard-card-icon">
              <FileText size={24} strokeWidth={2} />
            </div>
            <h2 className="dashboard-card-title">Dokumen Kontrak</h2>
            <p className="dashboard-card-desc">
              Lihat daftar kontrak dan dokumen terkait seperti Approval Drawing dan BOQ.
            </p>
            <span className="dashboard-card-arrow">Buka →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
