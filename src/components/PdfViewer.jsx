import { X, Maximize2, ExternalLink, Download } from 'lucide-react';

function getIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

export default function PdfViewer({ dokumen, onClose }) {
  const isMobile = getIsMobile();

  if (!dokumen) return null;

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer-header">
        <span className="pdf-viewer-title">{dokumen.nama}</span>
        <div className="pdf-viewer-controls">
          <a
            href={dokumen.path}
            target="_blank"
            rel="noopener noreferrer"
            className="pdf-viewer-btn"
            aria-label="Buka di tab baru"
          >
            <Maximize2 size={16} strokeWidth={2.5} />
          </a>
          <button
            className="pdf-viewer-btn"
            onClick={onClose}
            aria-label="Tutup preview"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {isMobile ? (
        <div className="pdf-viewer-mobile-fallback">
          <p>Preview PDF tidak tersedia pada perangkat mobile.</p>
          <div className="pdf-viewer-mobile-actions">
            <a
              href={dokumen.path}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <ExternalLink size={18} strokeWidth={2.5} />
              Buka PDF
            </a>
            <a href={dokumen.path} download className="btn btn-secondary">
              <Download size={18} strokeWidth={2.5} />
              Download
            </a>
          </div>
        </div>
      ) : (
        <iframe
          src={dokumen.path}
          className="pdf-viewer-iframe"
          title={`Preview: ${dokumen.nama}`}
        />
      )}
    </div>
  );
}
