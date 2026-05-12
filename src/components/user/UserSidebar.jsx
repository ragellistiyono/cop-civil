import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, ChartBar as BarChart3, Users, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const MENU_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/itp', label: 'ITP Management', icon: FileText },
  { path: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { path: '/dashboard/user-management', label: 'User Management', icon: Users },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function UserSidebar({ open, onClose }) {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
  };

  return (
    <>
      <div
        className={`user-sidebar-overlay${open ? ' visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`user-sidebar${open ? ' open' : ''}`}>
        <div className="user-sidebar-header">
          <div className="user-sidebar-brand">
            <img
              src="/images/pln-logo.png"
              alt="Logo PLN"
              className="user-sidebar-brand-logo"
            />
            <span className="user-sidebar-brand-text">PLN</span>
          </div>
          <button
            className="user-sidebar-close"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className="user-sidebar-nav" aria-label="Navigasi user">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`user-sidebar-item${isActive(item) ? ' active' : ''}`}
              aria-current={isActive(item) ? 'page' : undefined}
              onClick={onClose}
            >
              <item.icon size={20} strokeWidth={2} />
              <span className="user-sidebar-item-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="user-sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} strokeWidth={2} />
          <span className="user-sidebar-item-label">Keluar</span>
        </button>
      </aside>
    </>
  );
}
