import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useKontrakById } from '../hooks/useKontrak';
import DokumenItem from '../components/DokumenItem';
import PdfViewer from '../components/PdfViewer';
import Footer from '../components/Footer';

const STATUS_LABELS = {
  aktif: 'Aktif',
  selesai: 'Selesai',
  'dalam-proses': 'Dalam Proses',
};

export default function KontrakDetailPage() {
  const { id } = useParams();
  const { kontrak, loading, error } = useKontrakById(id);
  const [previewDokumen, setPreviewDokumen] = useState(null);

  if (loading) {
    return (
      <div className="kontrak-detail-loading section">
        <div className="container">
          <p>Memuat data kontrak…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kontrak-detail-error section">
        <div className="container">
          <p>Gagal memuat data: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!kontrak) {
    return (
      <section className="section kontrak-not-found">
        <div className="container">
          <div className="kontrak-empty">
            <AlertCircle size={48} strokeWidth={1.5} />
            <h2>Kontrak Tidak Ditemukan</h2>
            <p>
              Kontrak dengan ID "{id}" tidak ditemukan. Silakan kembali ke
              daftar kontrak.
            </p>
            <Link to="/kontrak" className="btn btn-primary">
              <ArrowLeft size={18} strokeWidth={2.5} />
              Kembali ke Daftar Kontrak
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section kontrak-detail-section">
        <div className="container">
          <nav className="kontrak-breadcrumb" aria-label="Breadcrumb">
            <Link to="/kontrak" className="kontrak-breadcrumb-link">
              Kontrak
            </Link>
            <ChevronRight size={14} strokeWidth={2.5} aria-hidden="true" />
            <span className="kontrak-breadcrumb-current">
              {kontrak.nomorKontrak}
            </span>
          </nav>

          <div className="kontrak-detail-header">
            <div>
              <h1 className="kontrak-detail-title">
                Kontrak {kontrak.nomorKontrak}
              </h1>
              <p className="kontrak-detail-subtitle">{kontrak.namaProyek}</p>
            </div>
            <span
              className={`badge kontrak-status kontrak-status--${kontrak.status}`}
            >
              {STATUS_LABELS[kontrak.status] || kontrak.status}
            </span>
          </div>

          <div className="kontrak-detail-info">
            <span className="kontrak-detail-date">
              Tanggal:{' '}
              {new Date(kontrak.tanggal).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="kontrak-dokumen-section">
            <h2 className="kontrak-dokumen-heading">Dokumen Terkait</h2>
            <div className="kontrak-dokumen-list">
              {kontrak.dokumen.map((dok) => (
                <DokumenItem
                  key={dok.id}
                  dokumen={dok}
                  onPreview={setPreviewDokumen}
                  isActive={previewDokumen?.id === dok.id}
                />
              ))}
            </div>
          </div>

          {previewDokumen && (
            <PdfViewer
              dokumen={previewDokumen}
              onClose={() => setPreviewDokumen(null)}
            />
          )}

          <div className="kontrak-detail-back">
            <Link to="/kontrak" className="btn btn-secondary">
              <ArrowLeft size={18} strokeWidth={2.5} />
              Kembali ke Daftar Kontrak
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
