import { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const THEME_META = {
  'hand-drawn': { emoji: '✏️', label: '1' },
  'neo-brutalism': { emoji: '💥', label: '2' },
  'playful-geometric': { emoji: '🔶', label: '3' },
  'professional': { emoji: '🏛️', label: '4' },
};

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div className="theme-switcher" ref={containerRef}>
      <div
        className={`theme-switcher-popover${isOpen ? ' open' : ''}`}
        role="listbox"
        aria-label="Pilih tema"
      >
        {themes.map(t => (
          <button
            key={t}
            className={`theme-option${theme === t ? ' active' : ''}`}
            onClick={() => { setTheme(t); setIsOpen(false); }}
            role="option"
            aria-selected={theme === t}
          >
            <span aria-hidden="true">{THEME_META[t].emoji}</span>
            {THEME_META[t].label}
          </button>
        ))}
      </div>
      <button
        className="theme-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ganti tema tampilan"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Palette size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}
