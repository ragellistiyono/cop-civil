import { HardHat, Search, ClipboardCheck, ShieldCheck } from 'lucide-react';

const SERVICES = [
  {
    icon: HardHat,
    title: 'Pekerjaan Beton',
    description: 'Inspeksi & pengawasan struktur beton meliputi pondasi, kolom, balok, dan pelat lantai.',
  },
  {
    icon: Search,
    title: 'Inspeksi Material',
    description: 'Pemeriksaan mutu agregat, semen, besi, dan air campuran beton sesuai spesifikasi RKS.',
  },
  {
    icon: ClipboardCheck,
    title: 'Digital Inspection',
    description: 'Checklist digital berbasis tahapan kerja: pra-pengecoran, saat pengecoran, dan pasca-pengecoran.',
  },
  {
    icon: ShieldCheck,
    title: 'Pengendalian Mutu',
    description: 'Slump test, uji kuat tekan, pemadatan beton, dan monitoring mutu secara real-time.',
  },
];

export default function Services() {
  return (
    <section className="section" aria-labelledby="services-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-subtitle">Layanan Kami</p>
          <h2 className="section-title" id="services-heading">
            Lingkup Pekerjaan
          </h2>
          <p className="section-description">
            Bidang keahlian utama dalam pengawasan dan pengendalian mutu pekerjaan sipil.
          </p>
        </div>
        <div className="grid-4">
          {SERVICES.map((service, index) => (
            <div className="card" key={index}>
              <div className="card-icon" aria-hidden="true">
                <service.icon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="card-title">{service.title}</h3>
              <p className="card-text">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
