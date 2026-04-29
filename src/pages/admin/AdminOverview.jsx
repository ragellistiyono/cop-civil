import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, ClipboardCheck, Clock, Eye } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers.js';
import { useAdminKontrak } from '../../hooks/useAdminKontrak.js';
import { useInspeksi } from '../../hooks/useInspeksi.js';

export default function AdminOverview() {
  const { total: userTotal, fetchUsers } = useUsers();
  const { total: kontrakTotal, fetchKontrak } = useAdminKontrak();
  const { inspeksiList: recentInspeksi, total: inspeksiTotal, fetchInspeksiList } = useInspeksi();
  const [pendingCount, setPendingCount] = useState(0);

  const { fetchInspeksiList: fetchPending } = useInspeksi();

  useEffect(() => {
    fetchUsers('', 1, 0);
    fetchKontrak('', 1, 0);
    fetchInspeksiList(null, 'submitted', 10, 0);
  }, [fetchUsers, fetchKontrak, fetchInspeksiList]);

  const loadPendingCount = useCallback(async () => {
    try {
      await fetchPending(null, 'submitted', 1, 0);
    } catch {
      // ignore
    }
  }, [fetchPending]);

  useEffect(() => {
    loadPendingCount();
  }, [loadPendingCount]);

  useEffect(() => {
    setPendingCount(inspeksiTotal);
  }, [inspeksiTotal]);

  const stats = [
    { label: 'Total User', value: userTotal, icon: Users, color: 'var(--color-accent)' },
    { label: 'Total Kontrak', value: kontrakTotal, icon: FileText, color: 'var(--color-success, var(--color-accent))' },
    { label: 'Total Inspeksi', value: pendingCount, icon: ClipboardCheck, color: 'var(--color-info, var(--color-secondary))' },
    { label: 'Inspeksi Pending', value: recentInspeksi.length, icon: Clock, color: 'var(--color-warning, var(--color-secondary))' },
  ];

  return (
    <>
      <p className="admin-overview-subtitle">Ringkasan data sistem CIVIL QTRACK UPT Malang</p>

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-stat-card card">
            <div className="admin-stat-icon" style={{ color: stat.color }}>
              <stat.icon size={24} strokeWidth={2} />
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-value">{stat.value}</span>
              <span className="admin-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-section card">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Laporan Inspeksi Terbaru</h2>
          <Link to="/admin/inspeksi" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            Lihat Semua
          </Link>
        </div>

        {recentInspeksi.length === 0 ? (
          <div className="admin-table-empty">
            <p>Belum ada laporan inspeksi.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Lokasi</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentInspeksi.map((item) => (
                  <tr key={item.$id}>
                    <td className="admin-table-date">
                      {item.tanggalInspeksi
                        ? new Date(item.tanggalInspeksi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="admin-table-name">{item.lokasi || '-'}</td>
                    <td>{item.userName || '-'}</td>
                    <td>
                      <span className={`inspeksi-status-badge inspeksi-status-badge--${item.status}`}>
                        {item.status === 'submitted' ? 'Terkirim' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/inspeksi/${item.$id}`} className="admin-action-btn" aria-label={`Lihat inspeksi ${item.lokasi}`}>
                        <Eye size={16} strokeWidth={2} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-quick-actions">
        <Link to="/admin/users" className="btn btn-secondary">
          <Users size={18} strokeWidth={2} />
          <span>Kelola User</span>
        </Link>
        <Link to="/admin/kontrak" className="btn btn-secondary">
          <FileText size={18} strokeWidth={2} />
          <span>Kelola Kontrak</span>
        </Link>
      </div>
    </>
  );
}
