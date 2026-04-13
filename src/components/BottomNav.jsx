import { Link } from 'react-router-dom';
import { Home, BookOpen, HardHat, HelpCircle } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/panduan', label: 'Panduan', icon: BookOpen },
  { path: '/pekerjaan-beton', label: 'Beton', icon: HardHat },
  { path: '/qna', label: 'Q&A', icon: HelpCircle },
];

export default function BottomNav({ currentPath }) {
  return (
    <>
      <nav className="bottom-nav" aria-label="Navigasi mobile">
        <div className="bottom-nav-inner">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item${currentPath === item.path ? ' active' : ''}`}
              aria-current={currentPath === item.path ? 'page' : undefined}
              aria-label={item.label}
            >
              <item.icon size={22} strokeWidth={2.5} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      <div className="bottom-nav-spacer" aria-hidden="true" />
    </>
  );
}
