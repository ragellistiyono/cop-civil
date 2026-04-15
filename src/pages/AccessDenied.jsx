import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="access-denied">
      <div className="access-denied-icon" aria-hidden="true">
        <ShieldAlert size={64} strokeWidth={1.5} />
      </div>
      <h2>Akses Ditolak</h2>
      <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={18} strokeWidth={2.5} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
