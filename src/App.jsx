import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import UnderConstruction from './components/UnderConstruction';
import KontrakPage from './pages/KontrakPage';
import KontrakDetailPage from './pages/KontrakDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';
import UserDashboard from './pages/UserDashboard';
import InspeksiFormPage from './pages/InspeksiFormPage';
import InspeksiListPage from './pages/InspeksiListPage';
import InspeksiDetailPage from './pages/InspeksiDetailPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUserPage from './pages/admin/AdminUserPage';
import AdminKontrakPage from './pages/admin/AdminKontrakPage';
import AdminNotifikasiPage from './pages/admin/AdminNotifikasiPage';
import SecurityDashboardPage from './pages/admin/SecurityDashboardPage';
import IncidentLogPage from './pages/admin/IncidentLogPage';
import BlocklistPage from './pages/admin/BlocklistPage';
import AiReportPage from './pages/admin/AiReportPage';
import SecurityConfigPage from './pages/admin/SecurityConfigPage';

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="users" element={<AdminUserPage />} />
          <Route path="kontrak" element={<AdminKontrakPage />} />
          <Route path="inspeksi" element={<InspeksiListPage />} />
          <Route path="inspeksi/:id" element={<InspeksiDetailPage />} />
          <Route path="notifikasi" element={<AdminNotifikasiPage />} />
          <Route path="security" element={<SecurityDashboardPage />} />
          <Route path="security/incidents" element={<IncidentLogPage />} />
          <Route path="security/blocklist" element={<BlocklistPage />} />
          <Route path="security/ai-reports" element={<AiReportPage />} />
          <Route path="security/config" element={<SecurityConfigPage />} />
        </Route>
      </Routes>
    );
  }

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
            path="/inspeksi"
            element={
              <ProtectedRoute>
                <InspeksiListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspeksi/baru"
            element={
              <ProtectedRoute>
                <InspeksiFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspeksi/:id"
            element={
              <ProtectedRoute>
                <InspeksiDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspeksi/:id/edit"
            element={
              <ProtectedRoute>
                <InspeksiFormPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <BottomNav currentPath={location.pathname} />
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
