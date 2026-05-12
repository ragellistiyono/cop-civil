export default function BlocklistTable({ blocklist, onUnblock }) {
  if (blocklist.length === 0) {
    return <p className="security-empty">Tidak ada IP yang diblokir.</p>;
  }

  return (
    <div className="security-table-wrapper">
      <table className="security-table">
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Alasan</th>
            <th>Tipe</th>
            <th>Diblokir Pada</th>
            <th>Kadaluarsa</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {blocklist.map((item) => (
            <tr key={item.$id}>
              <td><code>{item.ip_address}</code></td>
              <td>{item.reason}</td>
              <td>
                <span className={`security-badge security-badge--${item.block_type === 'auto' ? 'warned' : 'blocked'}`}>
                  {item.block_type === 'auto' ? 'Otomatis' : 'Manual'}
                </span>
              </td>
              <td>{new Date(item.blocked_at).toLocaleString('id-ID')}</td>
              <td>{item.expires_at ? new Date(item.expires_at).toLocaleString('id-ID') : 'Permanen'}</td>
              <td>
                <span className={`security-badge security-badge--${item.status === 'active' ? 'blocked' : 'logged'}`}>
                  {item.status === 'active' ? 'Aktif' : item.status === 'expired' ? 'Kadaluarsa' : 'Whitelist'}
                </span>
              </td>
              <td>
                {item.status === 'active' && (
                  <button
                    className="security-btn security-btn--ghost"
                    onClick={() => onUnblock(item.ip_address)}
                  >
                    Buka Blokir
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
