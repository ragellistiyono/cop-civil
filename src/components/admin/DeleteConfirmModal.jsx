import { AlertTriangle, AlertCircle, X } from 'lucide-react';

export default function DeleteConfirmModal({
  open, user, onClose, onConfirm, deleting, error = '',
  title = 'Hapus User',
  message,
  confirmLabel = 'Hapus User',
}) {
  if (!open || !user) return null;

  const defaultMessage = (
    <>
      Apakah Anda yakin ingin menghapus akun <strong>{user.name || user.email}</strong>
      {user.name ? ` (${user.email})` : ''}? Tindakan ini tidak dapat dibatalkan.
    </>
  );

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal-content card" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="delete-confirm-title" className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="modal-body delete-confirm-body">
          <div className="delete-confirm-icon" aria-hidden="true">
            <AlertTriangle size={48} strokeWidth={1.5} />
          </div>
          <p>{message || defaultMessage}</p>
        </div>

        {error && (
          <div className="login-error" role="alert" style={{ margin: '0 1.75rem' }}>
            <AlertCircle size={16} strokeWidth={2.5} />
            <span>{error}</span>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn modal-btn-cancel" onClick={onClose} disabled={deleting}>
            Batal
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Menghapus...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
