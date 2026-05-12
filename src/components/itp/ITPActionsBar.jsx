export default function ITPActionsBar({ onDelete, onPrint, onDraft, onSubmit, disabled }) {
  return (
    <div className="itp-actions-bar">
      <button type="button" className="itp-action-btn itp-action-btn--danger" onClick={onDelete} disabled={disabled}>
        HAPUS ITP
      </button>
      <button type="button" className="itp-action-btn itp-action-btn--info" onClick={onPrint} disabled={disabled}>
        CETAK PDF
      </button>
      <button type="button" className="itp-action-btn itp-action-btn--warning" onClick={onDraft} disabled={disabled}>
        SIMPAN SEBAGAI DRAFT
      </button>
      <button type="button" className="itp-action-btn itp-action-btn--success" onClick={onSubmit} disabled={disabled}>
        KIRIM LAPORAN
      </button>
    </div>
  );
}
