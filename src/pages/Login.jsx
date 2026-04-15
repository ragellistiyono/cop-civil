import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Memuat...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Silakan isi alamat email dan kata sandi.');
      return;
    }

    setSubmitting(true);
    try {
      const currentUser = await login(email, password);
      const isAdminUser = currentUser?.labels?.includes('admin') ?? false;
      navigate(isAdminUser ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (err) {
      setError(
        err?.message === 'Invalid credentials. Please check the email and password.'
          ? 'Email atau kata sandi tidak valid. Silakan coba kembali.'
          : 'Terjadi kesalahan. Silakan coba kembali.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section login-section">
      <div className="container">
        <div className="login-card card">
          <div className="login-header">
            <h1 className="login-title">Masuk ke CIVIL QTRACK</h1>
            <p className="login-subtitle">
              Sistem Manajemen Inspeksi Pekerjaan Sipil<br />
              PT PLN (Persero) UPT Malang
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">Alamat Email</label>
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="nama@pln.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={submitting}
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password" className="login-label">Kata Sandi</label>
              <input
                id="login-password"
                type="password"
                className="login-input"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                <AlertCircle size={16} strokeWidth={2.5} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader size={18} strokeWidth={2.5} className="spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn size={18} strokeWidth={2.5} />
                  Masuk
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
