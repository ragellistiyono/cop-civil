import { createContext, useContext, useState, useEffect } from 'react';

// ACTIVE THEME: Only 'industrial' is currently active.
// To re-enable theme switching, restore the original THEMES array check and uncomment ThemeSwitcher in App.jsx
const THEMES = ['hand-drawn', 'neo-brutalism', 'playful-geometric', 'professional', 'industrial'];
const STORAGE_KEY = 'pln-cop-theme';
const ACTIVE_THEME = 'industrial'; // <-- Change this to switch the locked theme

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Currently locked to ACTIVE_THEME. To restore multi-theme:
    // const saved = localStorage.getItem(STORAGE_KEY);
    // return THEMES.includes(saved) ? saved : THEMES[0];
    return ACTIVE_THEME;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* localStorage unavailable */
    }
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
