import { useState } from 'react';
import { Search } from 'lucide-react';

export default function IncidentFilters({ onApply }) {
  const [ip, setIp] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [action, setAction] = useState('');

  const handleApply = () => {
    onApply({ ip, category, severity, action });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <div className="security-filters">
      <div className="security-filter-group">
        <label htmlFor="filter-ip">IP Address</label>
        <input
          id="filter-ip"
          type="text"
          placeholder="Cari IP..."
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="security-filter-group">
        <label htmlFor="filter-category">Kategori</label>
        <select id="filter-category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Semua</option>
          <option value="sqli">SQL Injection</option>
          <option value="xss">XSS</option>
          <option value="cmdi">Command Injection</option>
          <option value="path_traversal">Path Traversal</option>
        </select>
      </div>

      <div className="security-filter-group">
        <label htmlFor="filter-severity">Tingkat</label>
        <select id="filter-severity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">Semua</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="security-filter-group">
        <label htmlFor="filter-action">Aksi</label>
        <select id="filter-action" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">Semua</option>
          <option value="blocked">Diblokir</option>
          <option value="warned">Diperingatkan</option>
          <option value="logged">Dicatat</option>
        </select>
      </div>

      <div className="security-filter-group">
        <label>&nbsp;</label>
        <button className="security-btn security-btn--primary" onClick={handleApply}>
          <Search size={16} /> Terapkan
        </button>
      </div>
    </div>
  );
}
