import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useInspeksi } from '../hooks/useInspeksi.js';
import { INSPEKSI_SCHEMA } from '../data/inspeksiSchema.js';

const PAGE_SIZE = 10;

function StatusBadge({ status }) {
  const modifier = status || 'draft';
  const labels = { draft: 'Draft', submitted: 'Terkirim' };
  return (
    <span className={`inspeksi-status-badge inspeksi-status-badge--${modifier}`}>
      {labels[status] || status}
    </span>
  );
}

function JenisTags({ jenisPekerjaan }) {
  if (!jenisPekerjaan) return null;
  const jenisIds = jenisPekerjaan.split(',').filter(Boolean);
  return (
    <div className="inspeksi-list-tags">
      {jenisIds.map((id) => (
        <span key={id} className="inspeksi-list-tag">
          {INSPEKSI_SCHEMA[id]?.label || id}
        </span>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function InspeksiListPage() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { inspeksiList, total, loading, error, fetchInspeksiList } = useInspeksi();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const refresh = useCallback(() => {
    const userId = isAdminRoute ? null : user?.$id;
    fetchInspeksiList(userId, null, PAGE_SIZE, offset);
  }, [fetchInspeksiList, isAdminRoute, user?.$id, offset]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCardClick = (inspeksiId) => {
    const basePath = isAdminRoute ? '/admin/inspeksi' : '/inspeksi';
    navigate(`${basePath}/${inspeksiId}`);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="inspeksi-list-header">
          <div>
            <h1>{isAdminRoute ? 'Semua Laporan Inspeksi' : 'Riwayat Inspeksi'}</h1>
            <p className="admin-subtitle">
              {isAdminRoute
                ? 'Daftar seluruh laporan inspeksi yang masuk'
                : 'Laporan inspeksi yang pernah Anda buat'}
            </p>
          </div>
          {!isAdminRoute && (
            <Link to="/inspeksi/baru" className="btn btn-primary">
              <Plus size={18} strokeWidth={2.5} />
              <span>Buat Laporan Baru</span>
            </Link>
          )}
        </div>

        {error && (
          <div className="login-error" role="alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} strokeWidth={2.5} />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="auth-loading">
            <div className="auth-loading-spinner" />
            <p>Memuat data...</p>
          </div>
        )}

        {!loading && inspeksiList.length === 0 && (
          <div className="kontrak-empty card">
            <h2>Belum ada laporan inspeksi</h2>
            {!isAdminRoute && (
              <Link to="/inspeksi/baru" className="btn btn-primary">
                Buat Laporan Pertama
              </Link>
            )}
          </div>
        )}

        {!loading && inspeksiList.length > 0 && (
          <div className="inspeksi-list">
            {inspeksiList.map((item) => (
              <button
                key={item.$id}
                type="button"
                className="card inspeksi-list-card"
                onClick={() => handleCardClick(item.$id)}
              >
                <div className="inspeksi-list-card-top">
                  <StatusBadge status={item.status} />
                  {isAdminRoute && (
                    <span className="inspeksi-list-card-user">{item.userName}</span>
                  )}
                </div>
                <h3 className="inspeksi-list-card-lokasi">{item.lokasi || 'Tanpa lokasi'}</h3>
                <div className="inspeksi-list-card-meta">
                  <span className="kontrak-meta-item">
                    <Calendar size={14} />
                    {formatDate(item.tanggalInspeksi)}
                  </span>
                  <span className="kontrak-meta-item">
                    <MapPin size={14} />
                    {item.lokasi || '-'}
                  </span>
                </div>
                <JenisTags jenisPekerjaan={item.jenisPekerjaan} />
              </button>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="admin-pagination">
            <span className="admin-pagination-info">
              Menampilkan {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} dari {total} laporan
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
    </section>
  );
}
