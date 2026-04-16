import { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Pencil, MapPin, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useInspeksi } from '../hooks/useInspeksi.js';
import StepRingkasan from '../components/inspeksi/StepRingkasan';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const modifier = status || 'draft';
  const labels = { draft: 'Draft', submitted: 'Terkirim' };
  return (
    <span className={`inspeksi-status-badge inspeksi-status-badge--${modifier}`}>
      {labels[status] || status}
    </span>
  );
}

export default function InspeksiDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { inspeksi, loading, error, fetchInspeksiById, getPhotoUrl } = useInspeksi();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const backLink = isAdminRoute ? '/admin/inspeksi' : '/inspeksi';

  useEffect(() => {
    if (id) fetchInspeksiById(id);
  }, [id, fetchInspeksiById]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="auth-loading">
            <div className="auth-loading-spinner" />
            <p>Memuat detail inspeksi...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !inspeksi) {
    return (
      <section className="section">
        <div className="container">
          <div className="kontrak-empty card">
            <h2>{error || 'Inspeksi tidak ditemukan'}</h2>
            <Link to={backLink} className="btn btn-secondary">Kembali</Link>
          </div>
        </div>
      </section>
    );
  }

  const jenisPekerjaan = inspeksi.jenisPekerjaan ? inspeksi.jenisPekerjaan.split(',') : [];
  let parsedData = {};
  try { parsedData = JSON.parse(inspeksi.data || '{}'); } catch { /* empty */ }

  const formData = {
    tanggalInspeksi: inspeksi.tanggalInspeksi,
    lokasi: inspeksi.lokasi,
    kontrakId: inspeksi.kontrakId,
    jenisPekerjaan,
    ...parsedData,
  };

  const isOwner = user?.$id === inspeksi.userId;
  const isDraft = inspeksi.status === 'draft';

  return (
    <section className="section">
      <div className="container">
        <div className="kontrak-breadcrumb">
          <Link to={backLink} className="kontrak-breadcrumb-link">
            <ChevronLeft size={16} /> {isAdminRoute ? 'Semua Inspeksi' : 'Riwayat Inspeksi'}
          </Link>
        </div>

        <div className="card inspeksi-detail-header">
          <div className="inspeksi-detail-header-info">
            <div className="inspeksi-detail-header-top">
              <StatusBadge status={inspeksi.status} />
              {isDraft && isOwner && !isAdminRoute && (
                <Link to={`/inspeksi/${id}/edit`} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>
                  <Pencil size={16} />
                  <span>Lanjutkan Edit</span>
                </Link>
              )}
            </div>

            <h1 className="kontrak-detail-title">{inspeksi.lokasi || 'Tanpa lokasi'}</h1>

            <div className="inspeksi-detail-meta">
              <span className="kontrak-meta-item">
                <Calendar size={16} />
                {formatDate(inspeksi.tanggalInspeksi)}
              </span>
              <span className="kontrak-meta-item">
                <MapPin size={16} />
                {inspeksi.lokasi}
              </span>
              <span className="kontrak-meta-item">
                <User size={16} />
                {inspeksi.userName}
              </span>
            </div>

            {inspeksi.submittedAt && (
              <p className="inspeksi-detail-submitted">
                Dikirim pada {formatDate(inspeksi.submittedAt)}
              </p>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <StepRingkasan formData={formData} getPhotoUrl={getPhotoUrl} />
        </div>
      </div>
    </section>
  );
}
