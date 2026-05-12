export default function ITPActionsBar({ onDelete, onPrint, onDraft, onSubmit, disabled }) {
  return (
    <div className="itp-actions-bar">
      <button type="button" className="itp-action-btn itp-action-btn--danger" onClick={onDelete} disabled={disabled}>
        HAPUS ITP (Merah)
      </button>
      <button type="button" className="itp-action-btn itp-action-btn--info" onClick={onPrint} disabled={disabled}>
        CETAK PDF (Biru)
      </button>
      <button type="button" className="itp-action-btn itp-action-btn--warning" onClick={onDraft} disabled={disabled}>
        SIMPAN SEBAGAI DRAFT (Kuning)
      </button>
      <button type="button" className="itp-action-btn itp-action-btn--success" onClick={onSubmit} disabled={disabled}>
        KIRIM LAPORAN (Hijau)
      </button>
    </div>
  );
}
