import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIncidents } from '../../hooks/useIncidents.js';
import IncidentFilters from '../../components/admin/security/IncidentFilters.jsx';
import IncidentTable from '../../components/admin/security/IncidentTable.jsx';

const PAGE_SIZE = 25;

export default function IncidentLogPage() {
  const { incidents, total, loading, error, fetchIncidents } = useIncidents();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const loadData = useCallback(() => {
    fetchIncidents({ page, limit: PAGE_SIZE, ...filters });
  }, [page, filters, fetchIncidents]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleApply = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div>
      <IncidentFilters onApply={handleApply} />

      {error && <div className="security-error">Gagal memuat data: {error}</div>}

      {loading ? (
        <div className="security-loading">Memuat insiden...</div>
      ) : (
        <IncidentTable incidents={incidents} />
      )}

      {totalPages > 1 && (
        <div className="security-pagination">
          <span>
            Halaman {page} dari {totalPages} ({total} insiden)
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
    </div>
  );
}
