import { useState, useEffect } from 'react';
import { BrainCircuit, Loader } from 'lucide-react';
import { useAiReports } from '../../hooks/useAiReports.js';
import AiReportCard from '../../components/admin/security/AiReportCard.jsx';
import AiReportDetail from '../../components/admin/security/AiReportDetail.jsx';

export default function AiReportPage() {
  const { reports, loading, generating, error, fetchReports, generateReport } = useAiReports();
  const [selectedReport, setSelectedReport] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerate = async () => {
    if (!periodStart || !periodEnd) {
      alert('Pilih periode awal dan akhir.');
      return;
    }

    try {
      await generateReport({
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString(),
      });
      setShowGenerate(false);
      setPeriodStart('');
      setPeriodEnd('');
      fetchReports();
    } catch {
      // error handled by hook
    }
  };

  if (selectedReport) {
    return (
      <AiReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} />
    );
  }

  return (
    <div>
      <div className="security-page-header">
        <div className="security-page-header-actions">
          {showGenerate ? (
            <div className="security-filters" style={{ margin: 0 }}>
              <div className="security-filter-group">
                <label htmlFor="gen-start">Periode Awal</label>
                <input
                  id="gen-start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className="security-filter-group">
                <label htmlFor="gen-end">Periode Akhir</label>
                <input
                  id="gen-end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
              <div className="security-filter-group">
                <label>&nbsp;</label>
                <button
                  className="security-btn security-btn--primary"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <><Loader size={16} className="spin" /> Membuat laporan...</>
                  ) : (
                    'Buat'
                  )}
                </button>
              </div>
              <div className="security-filter-group">
                <label>&nbsp;</label>
                <button
                  className="security-btn security-btn--secondary"
                  onClick={() => setShowGenerate(false)}
                  disabled={generating}
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              className="security-btn security-btn--primary"
              onClick={() => setShowGenerate(true)}
            >
              <BrainCircuit size={16} /> Buat Laporan
            </button>
          )}
        </div>
      </div>

      {error && <div className="security-error">Gagal: {error}</div>}

      {loading ? (
        <div className="security-loading">Memuat laporan...</div>
      ) : reports.length === 0 ? (
        <p className="security-empty">Belum ada laporan AI. Buat laporan pertama Anda.</p>
      ) : (
        reports.map((report) => (
          <AiReportCard
            key={report.$id}
            report={report}
            onClick={setSelectedReport}
          />
        ))
      )}
    </div>
  );
}
