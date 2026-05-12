import { useState, useEffect, useCallback } from 'react';
import { ShieldBan, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBlocklist } from '../../hooks/useBlocklist.js';
import BlocklistTable from '../../components/admin/security/BlocklistTable.jsx';
import BlockIpModal from '../../components/admin/security/BlockIpModal.jsx';

const PAGE_SIZE = 25;

export default function BlocklistPage() {
  const { blocklist, total, loading, error, fetchBlocklist, blockIp, unblockIp, cleanupExpired } =
    useBlocklist();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('active');
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(() => {
    fetchBlocklist({ page, limit: PAGE_SIZE, status });
  }, [page, status, fetchBlocklist]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleBlock = async (data) => {
    await blockIp(data);
    loadData();
  };

  const handleUnblock = async (ipAddress) => {
    if (!confirm(`Buka blokir untuk ${ipAddress}?`)) return;
    await unblockIp({ ip_address: ipAddress });
    loadData();
  };

  const handleCleanup = async () => {
    const result = await cleanupExpired();
    if (result) {
      alert(`${result.cleaned} blokir kadaluarsa telah dibersihkan.`);
      loadData();
    }
  };

  return (
    <div>
      <div className="security-page-header">
        <div className="security-page-header-actions">
          <button className="security-btn security-btn--danger" onClick={() => setModalOpen(true)}>
            <ShieldBan size={16} /> Blokir IP
          </button>
          <button className="security-btn security-btn--secondary" onClick={handleCleanup}>
            <Trash2 size={16} /> Bersihkan Kadaluarsa
          </button>
        </div>

        <div className="security-filter-group">
          <label htmlFor="blocklist-status">Status</label>
          <select
            id="blocklist-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="active">Aktif</option>
            <option value="expired">Kadaluarsa</option>
            <option value="semua">Semua</option>
          </select>
        </div>
      </div>

      {error && <div className="security-error">Gagal memuat data: {error}</div>}

      {loading ? (
        <div className="security-loading">Memuat daftar blokir...</div>
      ) : (
        <BlocklistTable blocklist={blocklist} onUnblock={handleUnblock} />
      )}

      {totalPages > 1 && (
        <div className="security-pagination">
          <span>
            Halaman {page} dari {totalPages} ({total} IP)
          </span>
          <div className="security-pagination-buttons">
            <button
              className="security-btn security-btn--secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <button
              className="security-btn security-btn--secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Selanjutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <BlockIpModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleBlock} />
    </div>
  );
}
