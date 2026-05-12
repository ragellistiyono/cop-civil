import { useState } from 'react';
import SeverityBadge from './SeverityBadge.jsx';
import ActionBadge from './ActionBadge.jsx';
import CategoryBadge from './CategoryBadge.jsx';
import IncidentDetailRow from './IncidentDetailRow.jsx';

export default function IncidentTable({ incidents }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (incidents.length === 0) {
    return <p className="security-empty">Tidak ada insiden ditemukan.</p>;
  }

  return (
    <div className="security-table-wrapper">
      <table className="security-table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>IP</th>
            <th>Kategori</th>
            <th>Tingkat</th>
            <th>Skor</th>
            <th>Aksi</th>
            <th>Layer</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <>
              <tr
                key={inc.$id}
                className="clickable"
                onClick={() => toggleExpand(inc.$id)}
                aria-expanded={expandedId === inc.$id}
              >
                <td>{new Date(inc.timestamp).toLocaleString('id-ID')}</td>
                <td><code>{inc.ip_address}</code></td>
                <td><CategoryBadge category={inc.attack_category} /></td>
                <td><SeverityBadge severity={inc.severity} /></td>
                <td>{inc.threat_score}</td>
                <td><ActionBadge action={inc.action_taken} /></td>
                <td>{inc.layer}</td>
              </tr>
              {expandedId === inc.$id && (
                <IncidentDetailRow key={`${inc.$id}-detail`} incident={inc} />
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
