export default function AiReportCard({ report, onClick }) {
  return (
    <div className="security-report-card" onClick={() => onClick(report)} role="button" tabIndex={0}>
      <div className="security-report-card-header">
        <span className="security-report-card-date">
          {new Date(report.generated_at).toLocaleString('id-ID')}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className={`security-badge security-badge--${report.report_type === 'periodic' ? 'logged' : 'warned'}`}>
            {report.report_type === 'periodic' ? 'Periodik' : 'On-Demand'}
          </span>
          <span className="security-badge security-badge--low">{report.model_used}</span>
        </div>
      </div>
      <p className="security-report-card-summary">{report.summary}</p>
    </div>
  );
}
