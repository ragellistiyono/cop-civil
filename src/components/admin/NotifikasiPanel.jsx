import { useEffect, useRef } from 'react';
import { X, ClipboardList, CheckCircle } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}

export default function NotifikasiPanel({ open, onClose, notifikasi, onRead, onNavigate }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="notifikasi-panel"
      role="dialog"
      aria-label="Panel Notifikasi"
    >
      <div className="notifikasi-panel-header">
        <h3 className="notifikasi-panel-title">Notifikasi</h3>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup">
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="notifikasi-panel-body">
        {(!notifikasi || notifikasi.length === 0) && (
          <p className="notifikasi-panel-empty">Tidak ada notifikasi.</p>
        )}

        {notifikasi?.map((n) => (
          <button
            key={n.$id}
            type="button"
            className={`notifikasi-item${n.read ? '' : ' notifikasi-item--unread'}`}
            onClick={() => {
              onRead(n.$id);
              onNavigate(n.referenceId);
            }}
          >
            <div className="notifikasi-item-icon">
              {n.read
                ? <CheckCircle size={18} strokeWidth={2} />
                : <ClipboardList size={18} strokeWidth={2} />}
            </div>
            <div className="notifikasi-item-content">
              <span className="notifikasi-item-message">{n.message}</span>
              <span className="notifikasi-item-time">{timeAgo(n.createdAt || n.$createdAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
