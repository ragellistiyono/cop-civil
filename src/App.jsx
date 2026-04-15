import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
// DISABLED: Theme switcher floating button — uncomment to re-enable multi-theme support
// import ThemeSwitcher from './components/ThemeSwitcher';
import Home from './pages/Home';
import UnderConstruction from './components/UnderConstruction';
import KontrakPage from './pages/KontrakPage';
import KontrakDetailPage from './pages/KontrakDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

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
          <Route path="/kontrak" element={<KontrakPage />} />
          <Route path="/kontrak/:id" element={<KontrakDetailPage />} />
          <Route path="/qna" element={<UnderConstruction title="Q & A" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <BottomNav currentPath={location.pathname} />
      {/* DISABLED: Theme switcher floating button — uncomment to re-enable */}
      {/* <ThemeSwitcher /> */}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
