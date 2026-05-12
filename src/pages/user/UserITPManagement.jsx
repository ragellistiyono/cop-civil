import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useITP } from '../../hooks/useITP.js';

export default function UserITPManagement() {
  const { itpList, fetchITPList, loading } = useITP();

  useEffect(() => { fetchITPList(); }, [fetchITPList]);

  return (
    <div className="itp-dashboard">
      <div className="itp-page-header">
        <h1 className="itp-dashboard-title">ITP MANAGEMENT</h1>
        <Link to="/dashboard" className="itp-action-btn itp-action-btn--success">
          <Plus size={16} strokeWidth={2} /> ITP Baru
        </Link>
      </div>

      <div className="itp-section-card">
        <div className="itp-table-wrapper">
          <table className="itp-table">
            <thead>
              <tr>
                <th>ITP No</th>
                <th>Lokasi</th>
                <th>Tanggal Pengecoran</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="itp-table-empty">Memuat...</td></tr>
              ) : itpList.length === 0 ? (
                <tr><td colSpan="4" className="itp-table-empty">Belum ada ITP.</td></tr>
              ) : (
                itpList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.itpNo}</td>
                    <td>{item.lokasi}</td>
                    <td>{item.tanggalPengecoran}</td>
                    <td>
                      <span className={`itp-status-badge itp-status-badge--${item.status}`}>
                        {item.status === 'submitted' ? 'Terkirim' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
