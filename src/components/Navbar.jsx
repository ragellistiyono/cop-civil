import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import UserMenu from './UserMenu';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/panduan', label: 'Panduan' },
  { path: '/kontrak', label: 'Kontrak' },
  { path: '/qna', label: 'Q & A' },
];

export default function Navbar({ currentPath }) {
  const { isAuthenticated, loading } = useAuth();

  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" aria-label="CIVIL QTRACK UPT Malang - Beranda">
          
          <span>CIVIL QTRACK</span>
          <span className="navbar-logo-secondary">UPT Malang</span>
        </Link>

        <nav className="navbar-links" aria-label="Navigasi utama">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-link${currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path)) ? ' active' : ''}`}
              aria-current={currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path)) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {!loading && (
          isAuthenticated ? (
            <div className="navbar-login">
              <UserMenu />
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary navbar-login" aria-label="Masuk ke akun">
              Masuk
            </Link>
          )
        )}
      </div>
    </header>
  );
}
