import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import NotifikasiBadge from './NotifikasiBadge';
import NotifikasiPanel from './NotifikasiPanel';
import { useNotifikasi } from '../../hooks/useNotifikasi.js';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Manajemen User',
  '/admin/kontrak': 'Manajemen Kontrak',
  '/admin/inspeksi': 'Laporan Inspeksi',
  '/admin/notifikasi': 'Notifikasi',
  '/admin/security': 'Ringkasan Keamanan',
  '/admin/security/incidents': 'Log Insiden',
  '/admin/security/blocklist': 'Daftar Blokir IP',
  '/admin/security/ai-reports': 'Laporan AI',
  '/admin/security/config': 'Konfigurasi Keamanan',
};

function getPageTitle(pathname) {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || (path !== '/admin/dashboard' && pathname.startsWith(path))) {
      return title;
    }
  }
  return 'Admin';
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { notifikasi: notifList, unreadCount, fetchNotifikasi, getUnreadCount, markAsRead } = useNotifikasi();
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    getUnreadCount();
    fetchNotifikasi(15);
  }, [getUnreadCount, fetchNotifikasi]);

  const handleNotifNavigate = (referenceId) => {
    setNotifOpen(false);
    navigate(`/admin/inspeksi/${referenceId}`);
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="admin-layout">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-topbar-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
            >
              <Menu size={22} strokeWidth={2} />
            </button>
            <h1 className="admin-topbar-title">{pageTitle}</h1>
          </div>

          <div className="admin-topbar-right">
            <NotifikasiBadge count={unreadCount} onClick={() => setNotifOpen((p) => !p)} />
            <NotifikasiPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifikasi={notifList}
              onRead={markAsRead}
              onNavigate={handleNotifNavigate}
            />
          </div>
        </header>

        <div className="admin-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
