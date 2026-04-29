import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CircleCheck as CheckCircle } from 'lucide-react';
import { useNotifikasi } from '../../hooks/useNotifikasi.js';

export default function AdminNotifikasiPage() {
  const navigate = useNavigate();
  const { notifikasi, fetchNotifikasi, markAsRead } = useNotifikasi();

  useEffect(() => {
    fetchNotifikasi(50);
  }, [fetchNotifikasi]);

  const handleClick = async (item) => {
    if (!item.isRead) {
      await markAsRead(item.$id);
    }
    if (item.referenceId) {
      navigate(`/admin/inspeksi/${item.referenceId}`);
    }
  };

  return (
    <>
      <div className="admin-section card">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Semua Notifikasi</h2>
        </div>

        {notifikasi.length === 0 ? (
          <div className="admin-table-empty">
            <Bell size={32} strokeWidth={1.5} />
            <p>Belum ada notifikasi.</p>
          </div>
        ) : (
          <div className="admin-notifikasi-list">
            {notifikasi.map((item) => (
              <button
                key={item.$id}
                className={`admin-notifikasi-item${item.isRead ? '' : ' unread'}`}
                onClick={() => handleClick(item)}
              >
                <div className="admin-notifikasi-item-icon">
                  {item.isRead ? (
                    <CheckCircle size={18} strokeWidth={2} />
                  ) : (
                    <Bell size={18} strokeWidth={2} />
                  )}
                </div>
                <div className="admin-notifikasi-item-content">
                  <span className="admin-notifikasi-item-message">{item.message}</span>
                  <span className="admin-notifikasi-item-time">
                    {item.$createdAt
                      ? new Date(item.$createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
