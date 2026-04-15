import { FileImage, FileSpreadsheet, FileText, Eye, Download } from 'lucide-react';

const TIPE_CONFIG = {
  'approval-drawing': { label: 'Approval Drawing', Icon: FileImage },
  boq: { label: 'BOQ', Icon: FileSpreadsheet },
  spesifikasi: { label: 'Spesifikasi', Icon: FileText },
  lainnya: { label: 'Dokumen', Icon: FileText },
};

export default function DokumenItem({ dokumen, onPreview, isActive }) {
  const config = TIPE_CONFIG[dokumen.tipe] || TIPE_CONFIG.lainnya;
  const { Icon, label } = config;

  return (
    <div className={`dokumen-item${isActive ? ' dokumen-item--active' : ''}`}>
      <div className="dokumen-item-icon">
        <Icon size={20} strokeWidth={2} />
      </div>

      <div className="dokumen-item-info">
        <span className="dokumen-item-name">{dokumen.nama}</span>
        <span className="badge dokumen-item-badge">{label}</span>
      </div>

      <div className="dokumen-item-actions">
        <button
          className="btn btn-secondary dokumen-btn"
          onClick={() => onPreview(dokumen)}
          aria-label={`Preview ${dokumen.nama}`}
        >
          <Eye size={16} strokeWidth={2.5} />
          <span className="dokumen-btn-label">Preview</span>
        </button>
        <a
          href={dokumen.path}
          download
          className="btn btn-primary dokumen-btn"
          aria-label={`Download ${dokumen.nama}`}
        >
          <Download size={16} strokeWidth={2.5} />
          <span className="dokumen-btn-label">Download</span>
        </a>
      </div>
    </div>
  );
}
