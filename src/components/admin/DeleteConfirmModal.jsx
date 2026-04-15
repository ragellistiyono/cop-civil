import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ open, user, onClose, onConfirm, deleting }) {
  if (!open || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Hapus User</h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="modal-body delete-confirm-body">
          <div className="delete-confirm-icon" aria-hidden="true">
            <AlertTriangle size={48} strokeWidth={1.5} />
          </div>
          <p>
            Apakah Anda yakin ingin menghapus akun <strong>{user.name || user.email}</strong>
            {user.name ? ` (${user.email})` : ''}? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn modal-btn-cancel" onClick={onClose} disabled={deleting}>
            Batal
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Menghapus...' : 'Hapus User'}
          </button>
        </div>
      </div>
    </div>
  );
}
