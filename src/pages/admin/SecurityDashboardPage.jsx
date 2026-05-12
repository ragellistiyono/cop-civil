import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useIncidents } from '../../hooks/useIncidents.js';
import { useBlocklist } from '../../hooks/useBlocklist.js';
import StatCard from '../../components/admin/security/StatCard.jsx';
import CategoryPieChart from '../../components/admin/security/CategoryPieChart.jsx';
import SeverityBadge from '../../components/admin/security/SeverityBadge.jsx';
import ActionBadge from '../../components/admin/security/ActionBadge.jsx';
import CategoryBadge from '../../components/admin/security/CategoryBadge.jsx';

export default function SecurityDashboardPage() {
  const { incidents, fetchIncidents, fetchStats, loading, error } = useIncidents();
  const { fetchActiveCount } = useBlocklist();

  const [stats, setStats] = useState({ total24h: 0, blocked24h: 0, categoryBreakdown: {} });
  const [activeBlocked, setActiveBlocked] = useState(0);

  useEffect(() => {
    fetchStats().then(setStats);
    fetchActiveCount().then(setActiveBlocked);
    fetchIncidents({ page: 1, limit: 5 });
  }, [fetchStats, fetchActiveCount, fetchIncidents]);

  if (error) {
    return <div className="security-error">Gagal memuat data: {error}</div>;
  }

  return (
    <div>
      <div className="security-stats-row">
        <StatCard
          label="Total Insiden (24 Jam)"
          value={stats.total24h}
          color="var(--severity-high)"
        />
        <StatCard
          label="Serangan Diblokir (24 Jam)"
          value={stats.blocked24h}
          color="var(--severity-critical)"
        />
        <StatCard
          label="IP Diblokir Aktif"
          value={activeBlocked}
          color="var(--severity-medium)"
        />
      </div>

      <CategoryPieChart data={stats.categoryBreakdown} />

      <div className="security-table-wrapper">
        <div className="security-page-header" style={{ padding: '1rem 1rem 0' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Insiden Terbaru</h3>
          <Link to="/admin/security/incidents" className="security-btn security-btn--ghost">
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="security-loading">Memuat...</div>
        ) : incidents.length === 0 ? (
          <p className="security-empty">Belum ada insiden tercatat.</p>
        ) : (
          <table className="security-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>IP</th>
                <th>Kategori</th>
                <th>Tingkat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.$id}>
                  <td>{new Date(inc.timestamp).toLocaleString('id-ID')}</td>
                  <td><code>{inc.ip_address}</code></td>
                  <td><CategoryBadge category={inc.attack_category} /></td>
                  <td><SeverityBadge severity={inc.severity} /></td>
                  <td><ActionBadge action={inc.action_taken} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
