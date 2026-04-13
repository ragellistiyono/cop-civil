import { Shield, Target } from 'lucide-react';

export default function About() {
  return (
    <section className="section section-alt" id="tentang" aria-labelledby="about-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-subtitle">Tentang Kami</p>
          <h2 className="section-title" id="about-heading">
            COP Civil UPT Malang
          </h2>
        </div>
        <div className="about-content">
          <div className="about-text">
            <p>
              COP Civil UPT Malang merupakan bagian dari PT PLN (Persero) yang bertanggung jawab
              atas pengawasan dan pengendalian mutu pekerjaan sipil dalam proyek konstruksi
              infrastruktur kelistrikan di wilayah UPT Malang.
            </p>
            <p>
              Tim kami memastikan setiap tahapan konstruksi — mulai dari perencanaan, pelaksanaan,
              hingga serah terima — memenuhi standar teknis yang ditetapkan dalam Rencana Kerja
              dan Syarat-syarat (RKS), sehingga menghasilkan infrastruktur yang aman, andal,
              dan berkelanjutan.
            </p>
          </div>
          <div className="about-highlights">
            <div className="about-highlight-item">
              <Shield size={24} strokeWidth={2.5} />
              <div>
                <strong>Standar Mutu Tinggi</strong>
                <p>Setiap pekerjaan diawasi berdasarkan Inspection &amp; Test Plan (ITP) yang terstandar.</p>
              </div>
            </div>
            <div className="about-highlight-item">
              <Target size={24} strokeWidth={2.5} />
              <div>
                <strong>Digital Inspection</strong>
                <p>Sistem inspeksi digital yang terstruktur untuk pengendalian mutu yang konsisten.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
