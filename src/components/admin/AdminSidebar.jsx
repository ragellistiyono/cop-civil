import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardCheck,
  Bell,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import SecuritySidebarGroup from './security/SecuritySidebarGroup.jsx';

const MENU_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Manajemen User', icon: Users },
  { path: '/admin/kontrak', label: 'Manajemen Kontrak', icon: FileText },
  { path: '/admin/inspeksi', label: 'Laporan Inspeksi', icon: ClipboardCheck },
  { path: '/admin/notifikasi', label: 'Notifikasi', icon: Bell },
];

export default function AdminSidebar({ open, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.email || 'Admin';

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Session may have expired
    }
  };

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div
        className={`admin-sidebar-overlay${open ? ' visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin/dashboard" className="admin-sidebar-logo" onClick={onClose}>
            <span className="admin-sidebar-logo-main">CIVIL QTRACK</span>
            <span className="admin-sidebar-logo-sub">UPT Malang</span>
          </Link>
          <button
            className="admin-sidebar-close"
            onClick={onClose}
            aria-label="Tutup sidebar"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Navigasi admin">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-item${isActive(item.path) ? ' active' : ''}`}
              aria-current={isActive(item.path) ? 'page' : undefined}
              onClick={onClose}
            >
              <item.icon size={20} strokeWidth={2} />
              <span className="admin-sidebar-item-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <SecuritySidebarGroup onNavigate={onClose} />

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-user-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="admin-sidebar-user-info">
              <span className="admin-sidebar-user-name">{displayName}</span>
              <span className="admin-sidebar-user-role">Administrator</span>
            </div>
          </div>
          <button
            className="admin-sidebar-logout"
            onClick={handleLogout}
            aria-label="Keluar"
          >
            <LogOut size={18} strokeWidth={2} />
          </button>
        </div>
      </aside>
    </>
  );
}
