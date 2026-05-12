export default function IncidentDetailRow({ incident }) {
  let patterns = [];
  try {
    patterns = JSON.parse(incident.matched_patterns || '[]');
  } catch {
    patterns = [];
  }

  return (
    <tr className="security-detail-row">
      <td colSpan="7">
        <div className="security-detail-content">
          <div className="security-detail-item">
            <label>URL Lengkap</label>
            <span>{incident.request_url || '—'}</span>
          </div>
          <div className="security-detail-item">
            <label>User Agent</label>
            <span>{incident.user_agent || '—'}</span>
          </div>
          <div className="security-detail-item">
            <label>Pola Terdeteksi</label>
            <span>{Array.isArray(patterns) ? patterns.join(', ') : String(patterns)}</span>
          </div>
          <div className="security-detail-item">
            <label>Cuplikan Body</label>
            <span>{incident.request_body_snippet || '—'}</span>
          </div>
        </div>
      </td>
    </tr>
  );
}
