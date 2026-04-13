import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ThemeSwitcher from './components/ThemeSwitcher';
import Home from './pages/Home';
import UnderConstruction from './components/UnderConstruction';

function AppLayout() {
  const location = useLocation();

  return (
    <>
      <a href="#main-content" className="skip-nav">
        Langsung ke konten utama
      </a>
      <Navbar currentPath={location.pathname} />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/panduan" element={<UnderConstruction title="Panduan" />} />
          <Route path="/pekerjaan-beton" element={<UnderConstruction title="Pekerjaan Beton" />} />
          <Route path="/qna" element={<UnderConstruction title="Q & A" />} />
        </Routes>
      </main>
      <BottomNav currentPath={location.pathname} />
      <ThemeSwitcher />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
}
