import { Pencil, FileText, Trash2 } from 'lucide-react';

const STATUS_LABELS = {
  aktif: 'Aktif',
  selesai: 'Selesai',
  'dalam-proses': 'Dalam Proses',
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const modifier = status || 'aktif';
  return (
    <span className={`kontrak-status-badge kontrak-status-badge--${modifier}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function KontrakAdminTable({ kontrak, loading, onEdit, onManageDocs, onDelete }) {
  if (loading) {
    return (
      <div className="admin-table-loading">
        <div className="auth-loading-spinner" />
        <p>Memuat data kontrak...</p>
      </div>
    );
  }

  if (!kontrak || kontrak.length === 0) {
    return (
      <div className="admin-table-empty">
        <p>Belum ada data kontrak.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>No. Kontrak</th>
            <th>Nama Proyek</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th>Dokumen</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {kontrak.map((k) => (
            <tr key={k.$id}>
              <td className="admin-table-name">{k.nomorKontrak}</td>
              <td>{k.namaProyek}</td>
              <td className="admin-table-date">{formatDate(k.tanggal)}</td>
              <td><StatusBadge status={k.status} /></td>
              <td>{k.dokumen?.length || 0}</td>
              <td className="admin-table-actions">
                <button
                  className="admin-action-btn"
                  onClick={() => onEdit(k)}
                  aria-label={`Edit ${k.namaProyek}`}
                >
                  <Pencil size={16} strokeWidth={2} />
                </button>
                <button
                  className="admin-action-btn"
                  onClick={() => onManageDocs(k)}
                  aria-label={`Kelola dokumen ${k.namaProyek}`}
                >
                  <FileText size={16} strokeWidth={2} />
                </button>
                <button
                  className="admin-action-btn admin-action-btn--danger"
                  onClick={() => onDelete(k)}
                  aria-label={`Hapus ${k.namaProyek}`}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
