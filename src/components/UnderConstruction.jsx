import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

export default function UnderConstruction({ title }) {
  return (
    <div className="under-construction">
      <div className="under-construction-icon" aria-hidden="true">
        <Construction size={64} strokeWidth={2} />
      </div>
      <h2>{title}</h2>
      <p>Halaman ini sedang dalam pengembangan. Nantikan pembaruan selanjutnya.</p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={18} strokeWidth={2.5} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
