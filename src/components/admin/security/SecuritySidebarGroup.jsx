import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  ChevronRight,
  BarChart3,
  FileWarning,
  ShieldBan,
  BrainCircuit,
  Settings,
} from 'lucide-react';

const SECURITY_ITEMS = [
  { path: '/admin/security', label: 'Ringkasan', icon: BarChart3 },
  { path: '/admin/security/incidents', label: 'Log Insiden', icon: FileWarning },
  { path: '/admin/security/blocklist', label: 'Daftar Blokir', icon: ShieldBan },
  { path: '/admin/security/ai-reports', label: 'Laporan AI', icon: BrainCircuit },
  { path: '/admin/security/config', label: 'Konfigurasi', icon: Settings },
];

export default function SecuritySidebarGroup({ onNavigate }) {
  const location = useLocation();
  const isSecurityRoute = location.pathname.startsWith('/admin/security');
  const [expanded, setExpanded] = useState(isSecurityRoute);

  const isActive = (path) => {
    if (path === '/admin/security') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="security-sidebar-group">
      <button
        className={`security-sidebar-toggle${isSecurityRoute ? ' active' : ''}`}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <Shield size={20} strokeWidth={2} />
        <span className="admin-sidebar-item-label">Keamanan</span>
        <ChevronRight
          size={16}
          strokeWidth={2}
          className={`security-sidebar-toggle-chevron${expanded ? ' expanded' : ''}`}
        />
      </button>

      <div className={`security-sidebar-subitems${expanded ? ' expanded' : ''}`}>
        {SECURITY_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`security-sidebar-subitem${isActive(item.path) ? ' active' : ''}`}
            aria-current={isActive(item.path) ? 'page' : undefined}
            onClick={onNavigate}
          >
            <item.icon size={16} strokeWidth={2} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
