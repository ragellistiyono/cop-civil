import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        menuRef.current?.querySelector('.user-menu-btn')?.focus();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const displayName = user?.name || user?.email || 'User';

  const handleDashboard = () => {
    setOpen(false);
    navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
  };

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
    } catch {
      // Session may have expired — clear local state regardless
    }
    navigate('/');
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Menu pengguna"
      >
        <span className="user-menu-avatar">
          <User size={16} strokeWidth={2.5} />
        </span>
        <span className="user-menu-name">{displayName}</span>
        <ChevronDown size={14} strokeWidth={2.5} className={`user-menu-chevron${open ? ' open' : ''}`} />
      </button>

      <div className={`user-menu-dropdown${open ? ' open' : ''}`} role="menu">
        <button className="user-menu-item" role="menuitem" onClick={handleDashboard}>
          <LayoutDashboard size={16} strokeWidth={2} />
          Dashboard
        </button>
        <div className="user-menu-divider" />
        <button className="user-menu-item user-menu-item--logout" role="menuitem" onClick={handleLogout}>
          <LogOut size={16} strokeWidth={2} />
          Keluar
        </button>
      </div>
    </div>
  );
}
