import { FolderOpen } from 'lucide-react';
import { useKontrakList } from '../hooks/useKontrak';
import KontrakCard from '../components/KontrakCard';
import Footer from '../components/Footer';

export default function KontrakPage() {
  const { kontrakList, loading, error } = useKontrakList();

  return (
    <>
      <section className="section kontrak-section" aria-labelledby="kontrak-heading">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Dokumentasi Resmi</p>
            <h1 className="section-title" id="kontrak-heading">
              Dokumentasi Kontrak
            </h1>
            <p className="section-description">
              Akses dokumen resmi kontrak pekerjaan sipil PT PLN (Persero) UPT
              Malang. Tersedia dokumen Approval Drawing, Bill of Quantity (BOQ),
              dan dokumen pendukung lainnya untuk setiap paket pekerjaan.
            </p>
          </div>

          {loading && <p className="kontrak-loading">Memuat data kontrak…</p>}

          {error && (
            <p className="kontrak-error">Gagal memuat data: {error.message}</p>
          )}

          {!loading && !error && kontrakList.length === 0 && (
            <div className="kontrak-empty">
              <FolderOpen size={48} strokeWidth={1.5} />
              <p>Belum terdapat dokumen kontrak yang tersedia saat ini.</p>
            </div>
          )}

          {!loading && !error && kontrakList.length > 0 && (
            <div className="kontrak-grid">
              {kontrakList.map((kontrak) => (
                <KontrakCard key={kontrak.id} kontrak={kontrak} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
