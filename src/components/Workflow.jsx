const STEPS = [
  {
    number: '1',
    title: 'Persiapan',
    description: 'Input data pekerjaan, lokasi, jenis elemen beton',
  },
  {
    number: '2',
    title: 'Pra-Pengecoran',
    description: 'Inspeksi bekisting, tulangan, dan material',
  },
  {
    number: '3',
    title: 'Pengecoran',
    description: 'Slump test, pemadatan, dokumentasi pelaksanaan',
  },
  {
    number: '4',
    title: 'Pasca-Pengecoran',
    description: 'Curing, uji mutu, laporan otomatis',
  },
];

export default function Workflow() {
  return (
    <section className="section section-alt" aria-labelledby="workflow-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-subtitle">Alur Kerja</p>
          <h2 className="section-title" id="workflow-heading">
            Tahapan Inspeksi
          </h2>
          <p className="section-description">
            Proses pengawasan pekerjaan beton berbasis Inspection &amp; Test Plan (ITP).
          </p>
        </div>
        <div className="workflow-grid">
          {STEPS.map((step) => (
            <div className="workflow-step" key={step.number}>
              <div className="workflow-number" aria-hidden="true">
                {step.number}
              </div>
              <h3 className="workflow-title">{step.title}</h3>
              <p className="workflow-text">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
