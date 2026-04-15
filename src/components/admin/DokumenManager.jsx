import { useState } from 'react';
import { X, FileText, Upload, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const TIPE_OPTIONS = [
  { value: 'approval-drawing', label: 'Approval Drawing' },
  { value: 'boq', label: 'BOQ' },
  { value: 'lainnya', label: 'Lainnya' },
];

function SumberBadge({ sumber }) {
  return (
    <span className={`sumber-badge sumber-badge--${sumber}`}>
      {sumber === 'lokal' ? 'Lokal' : 'Cloud'}
    </span>
  );
}

function TipeBadge({ tipe }) {
  const label = TIPE_OPTIONS.find((t) => t.value === tipe)?.label || tipe;
  return <span className="dokumen-item-badge badge">{label}</span>;
}

export default function DokumenManager({ open, kontrak, onClose, onRefresh, adminHook }) {
  const { addDokumen, deleteDokumen, uploadFile } = adminHook;

  const [nama, setNama] = useState('');
  const [tipe, setTipe] = useState('approval-drawing');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  if (!open || !kontrak) return null;

  const dokumenList = kontrak.dokumen || [];

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!nama.trim()) { setUploadError('Nama dokumen wajib diisi.'); return; }
    if (!file) { setUploadError('Pilih file PDF untuk diunggah.'); return; }

    setUploading(true);
    try {
      const fileId = await uploadFile(file);
      await addDokumen(kontrak.$id, {
        tipe,
        nama: nama.trim(),
        fileId,
        sumber: 'appwrite',
      });
      setNama('');
      setTipe('approval-drawing');
      setFile(null);
      setUploadSuccess('Dokumen berhasil diunggah.');
      onRefresh();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (dokId) => {
    setDeletingId(dokId);
    setUploadError('');
    try {
      await deleteDokumen(dokId);
      onRefresh();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div
        className="dokumen-manager modal-content card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dokumen-manager-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="dokumen-manager-title" className="modal-title">
            Dokumen — {kontrak.nomorKontrak}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="modal-body">
          {/* Existing dokumen list */}
          <div className="dokumen-manager-list">
            {dokumenList.length === 0 && (
              <p className="admin-table-empty" style={{ padding: '1.5rem' }}>
                Belum ada dokumen.
              </p>
            )}
            {dokumenList.map((dok) => (
              <div className="dokumen-manager-item" key={dok.$id}>
                <div className="dokumen-manager-item-icon">
                  <FileText size={18} strokeWidth={2} />
                </div>
                <div className="dokumen-manager-item-info">
                  <span className="dokumen-manager-item-name">{dok.nama}</span>
                  <div className="dokumen-manager-item-badges">
                    <TipeBadge tipe={dok.tipe} />
                    <SumberBadge sumber={dok.sumber} />
                  </div>
                </div>
                {dok.sumber === 'appwrite' && (
                  <button
                    className="admin-action-btn admin-action-btn--danger"
                    onClick={() => handleDelete(dok.$id)}
                    disabled={deletingId === dok.$id}
                    aria-label={`Hapus ${dok.nama}`}
                  >
                    {deletingId === dok.$id
                      ? <div className="auth-loading-spinner" style={{ width: '1rem', height: '1rem' }} />
                      : <Trash2 size={16} strokeWidth={2} />
                    }
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload form */}
          <form className="dokumen-upload-form" onSubmit={handleUpload}>
            <h3 className="dokumen-upload-heading">Unggah Dokumen Baru</h3>

            <div className="login-field">
              <label htmlFor="dok-nama" className="login-label">Nama Dokumen</label>
              <input
                id="dok-nama"
                type="text"
                className="login-input"
                placeholder="Contoh: Approval Drawing 002.PJ.2025"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                disabled={uploading}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="dok-tipe" className="login-label">Tipe Dokumen</label>
              <select
                id="dok-tipe"
                className="login-input admin-select"
                value={tipe}
                onChange={(e) => setTipe(e.target.value)}
                disabled={uploading}
              >
                {TIPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="login-field">
              <label htmlFor="dok-file" className="login-label">File PDF</label>
              <div className="file-input-wrapper">
                <input
                  id="dok-file"
                  type="file"
                  accept=".pdf"
                  className="login-input"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={uploading}
                  required
                />
              </div>
            </div>

            {uploadError && (
              <div className="login-error" role="alert">
                <AlertCircle size={16} strokeWidth={2.5} />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="upload-success" role="status">
                <CheckCircle size={16} strokeWidth={2.5} />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={uploading} style={{ alignSelf: 'flex-start' }}>
              {uploading ? (
                <>
                  <div className="auth-loading-spinner" style={{ width: '1rem', height: '1rem' }} />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <Upload size={18} strokeWidth={2.5} />
                  <span>Unggah Dokumen</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
