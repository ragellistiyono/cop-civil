import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="section hero-section" aria-labelledby="hero-heading">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="badge">PT PLN (Persero)</span>
            <h1 id="hero-heading">
              COP Civil UPT Malang<br />
              <span className="hero-accent">Konstruksi</span>
            </h1>
            <p className="hero-tagline">
              Membangun fondasi kuat bagi infrastruktur kelistrikan yang andal dan berkelanjutan.
            </p>
            <div className="hero-cta-group">
              <Link to="/panduan" className="btn btn-primary">
                Lihat Panduan
                <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
              <a href="#tentang" className="btn btn-secondary">
                Pelajari Lebih Lanjut
                <ChevronDown size={18} strokeWidth={2.5} />
              </a>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-shape hero-shape-1" />
            <div className="hero-shape hero-shape-2" />
            <img
              src="/images/Logo_PLN.svg"
              alt="PLN Logo"
              className="hero-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
