const STATS = [
  { number: '150+', label: 'Proyek Selesai' },
  { number: '15+', label: 'Tahun Pengalaman' },
  { number: '50+', label: 'Tenaga Ahli' },
  { number: '99%', label: 'Tingkat Keberhasilan' },
];

export default function Stats() {
  return (
    <section className="section" aria-labelledby="stats-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-subtitle">Pencapaian</p>
          <h2 className="section-title" id="stats-heading">
            Dalam Angka
          </h2>
        </div>
        <div className="stats-grid">
          {STATS.map((stat, index) => (
            <div className="stat-item" key={index}>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
