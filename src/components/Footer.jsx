import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
  
              <span>CIVIL QTRACK UPT Malang</span>
            </div>
            <p>
              Membangun fondasi kuat bagi infrastruktur kelistrikan yang andal dan berkelanjutan.
            </p>
          </div>

          <div>
            <h3 className="footer-heading">Navigasi</h3>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/panduan" className="footer-link">Panduan</Link>
            <Link to="/pekerjaan-beton" className="footer-link">Pekerjaan Beton</Link>
            <Link to="/qna" className="footer-link">Q &amp; A</Link>
          </div>

          <div>
            <h3 className="footer-heading">Layanan</h3>
            <span className="footer-link">Pekerjaan Beton</span>
            <span className="footer-link">Inspeksi Material</span>
            <span className="footer-link">Digital Inspection</span>
            <span className="footer-link">Pengendalian Mutu</span>
          </div>

          <div>
            <h3 className="footer-heading">Kontak</h3>
            <div className="footer-contact-item">
              <MapPin size={16} strokeWidth={2.5} />
              <span>Jl. Raya Karanglo No.90, Karanglo, Banjararum, Kec. Singosari, Kabupaten Malang, Jawa Timur 65153</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} strokeWidth={2.5} />
              <span>copcivil.malang@pln.co.id</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={16} strokeWidth={2.5} />
              <span>(021) 123-4567</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 PT PLN (Persero) — CIVIL QTRACK UPT Malang. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
