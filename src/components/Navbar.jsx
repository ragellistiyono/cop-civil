import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/panduan', label: 'Panduan' },
  { path: '/kontrak', label: 'Kontrak' },
  { path: '/qna', label: 'Q & A' },
];

export default function Navbar({ currentPath }) {
  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" aria-label="COP Civil UPT Malang - Beranda">
          
          <span>COP Civil</span>
          <span className="navbar-logo-secondary">UPT Malang</span>
        </Link>

        <nav className="navbar-links" aria-label="Navigasi utama">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-link${currentPath === item.path ? ' active' : ''}`}
              aria-current={currentPath === item.path ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="btn btn-primary navbar-login" aria-label="Masuk ke akun">
          Masuk
        </button>
      </div>
    </header>
  );
}
