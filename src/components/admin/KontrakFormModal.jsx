import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function KontrakFormModal({ open, kontrak, onClose, onSubmit, submitting, externalError = '' }) {
  const isEdit = kontrak !== null;
  const [nomorKontrak, setNomorKontrak] = useState('');
  const [namaProyek, setNamaProyek] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [status, setStatus] = useState('aktif');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (kontrak) {
        setNomorKontrak(kontrak.nomorKontrak || '');
        setNamaProyek(kontrak.namaProyek || '');
        setTanggal(kontrak.tanggal || '');
        setStatus(kontrak.status || 'aktif');
      } else {
        setNomorKontrak('');
        setNamaProyek('');
        setTanggal('');
        setStatus('aktif');
      }
      setError('');
    }
  }, [open, kontrak]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!nomorKontrak.trim()) { setError('Nomor kontrak wajib diisi.'); return; }
    if (!namaProyek.trim()) { setError('Nama proyek wajib diisi.'); return; }
    if (!tanggal) { setError('Tanggal wajib diisi.'); return; }

    onSubmit({
      nomorKontrak: nomorKontrak.trim(),
      namaProyek: namaProyek.trim(),
      tanggal,
      status,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div
        className="modal-content card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kontrak-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="kontrak-form-title" className="modal-title">
            {isEdit ? 'Edit Kontrak' : 'Tambah Kontrak Baru'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="kontrak-nomor" className="login-label">Nomor Kontrak</label>
            <input
              id="kontrak-nomor"
              type="text"
              className="login-input"
              placeholder="Contoh: 002.PJ.2025"
              value={nomorKontrak}
              onChange={(e) => setNomorKontrak(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="kontrak-nama" className="login-label">Nama Proyek</label>
            <input
              id="kontrak-nama"
              type="text"
              className="login-input"
              placeholder="Masukkan nama proyek"
              value={namaProyek}
              onChange={(e) => setNamaProyek(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="kontrak-tanggal" className="login-label">Tanggal</label>
            <input
              id="kontrak-tanggal"
              type="date"
              className="login-input"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="kontrak-status" className="login-label">Status</label>
            <select
              id="kontrak-status"
              className="login-input admin-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting}
            >
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="dalam-proses">Dalam Proses</option>
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
                : isEdit ? 'Simpan Perubahan' : 'Tambah Kontrak'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
