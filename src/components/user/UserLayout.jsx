import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import UserSidebar from './UserSidebar';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const displayName = user?.name || 'Pengguna';

  return (
    <div className="user-layout">
      <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="user-main">
        <header className="user-topbar">
          <button
            className="user-topbar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <Menu size={22} strokeWidth={2} />
          </button>

          <div className="user-topbar-brand">
            <div className="user-topbar-logo" aria-hidden="true">
              <span>PLN</span>
            </div>
            <div className="user-topbar-brand-text">
              <span className="user-topbar-brand-main">PT PLN (Persero)</span>
              <span className="user-topbar-brand-sub">
                UNIT INDUK TRANSMISI JAWA BAGIAN TIMUR DAN BALI
              </span>
            </div>
          </div>

          <div className="user-topbar-search">
            <Search size={16} strokeWidth={2} className="user-topbar-search-icon" />
            <input
              type="search"
              placeholder="Search"
              aria-label="Cari"
              className="user-topbar-search-input"
            />
          </div>

          <button
            type="button"
            className="user-topbar-bell"
            aria-label="Notifikasi"
          >
            <Bell size={20} strokeWidth={2} />
            <span className="user-topbar-bell-dot" aria-hidden="true" />
          </button>

          <div className="user-topbar-profile">
            <div className="user-topbar-avatar" aria-hidden="true">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="user-topbar-profile-text">
              <span className="user-topbar-profile-role">User |</span>
              <span className="user-topbar-profile-name">{displayName}</span>
            </div>
          </div>
        </header>

        <main className="user-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
