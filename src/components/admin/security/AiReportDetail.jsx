import { ArrowLeft } from 'lucide-react';

export default function AiReportDetail({ report, onBack }) {
  let stats = {};
  try {
    stats = JSON.parse(report.stats_json || '{}');
  } catch {
    stats = {};
  }

  return (
    <div>
      <button className="security-btn security-btn--ghost" onClick={onBack} style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Kembali
      </button>

      <div className="security-chart-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 className="security-chart-title" style={{ margin: 0 }}>Laporan AI</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className={`security-badge security-badge--${report.report_type === 'periodic' ? 'logged' : 'warned'}`}>
              {report.report_type === 'periodic' ? 'Periodik' : 'On-Demand'}
            </span>
            <span className="security-badge security-badge--low">{report.model_used}</span>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Periode: {new Date(report.period_start).toLocaleDateString('id-ID')} – {new Date(report.period_end).toLocaleDateString('id-ID')}
          &nbsp;|&nbsp;Dibuat: {new Date(report.generated_at).toLocaleString('id-ID')}
        </div>

        <div className="security-form-section">
          <h4 className="security-form-section-title">Ringkasan</h4>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>{report.summary}</p>
        </div>

        {report.recommendations && (
          <div className="security-form-section">
            <h4 className="security-form-section-title">Rekomendasi</h4>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>{report.recommendations}</p>
          </div>
        )}

        {Object.keys(stats).length > 0 && (
          <div className="security-form-section">
            <h4 className="security-form-section-title">Statistik</h4>
            <div className="security-table-wrapper">
              <table className="security-table">
                <thead>
                  <tr>
                    <th>Metrik</th>
                    <th>Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
