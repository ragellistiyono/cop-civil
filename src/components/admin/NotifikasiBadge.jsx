import { Bell } from 'lucide-react';

export default function NotifikasiBadge({ count, onClick }) {
  return (
    <button
      type="button"
      className="admin-action-btn notifikasi-bell-btn"
      onClick={onClick}
      aria-label={`Notifikasi${count > 0 ? ` (${count} belum dibaca)` : ''}`}
    >
      <Bell size={20} strokeWidth={2} />
      {count > 0 && (
        <span className="notifikasi-badge">{count > 99 ? '99+' : count}</span>
      )}
    </button>
  );
}
