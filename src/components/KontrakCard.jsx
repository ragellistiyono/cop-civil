import { Link } from 'react-router-dom';
import { FileText, Calendar, FolderOpen } from 'lucide-react';
import { STATUS_LABELS } from '../data/kontrak.js';

export default function KontrakCard({ kontrak }) {
  return (
    <Link to={`/kontrak/${kontrak.id}`} className="kontrak-card card">
      <div className="kontrak-card-header">
        <div className="card-icon kontrak-card-icon">
          <FolderOpen size={24} strokeWidth={2} />
        </div>
        <span className={`badge kontrak-status kontrak-status--${kontrak.status}`}>
          {STATUS_LABELS[kontrak.status] || kontrak.status}
        </span>
      </div>

      <h3 className="card-title">Kontrak {kontrak.nomorKontrak}</h3>
      <p className="card-text">{kontrak.namaProyek}</p>

      <div className="kontrak-card-meta">
        <span className="kontrak-meta-item">
          <Calendar size={14} strokeWidth={2} />
          {new Date(kontrak.tanggal).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <span className="kontrak-meta-item">
          <FileText size={14} strokeWidth={2} />
          {kontrak.dokumen.length} Dokumen
        </span>
      </div>
    </Link>
  );
}
