import { PenLine } from 'lucide-react';

const ITEMS = [
  { key: 'direksiPekerjaan', label: 'Direksi Pekerjaan', action: 'Minta Tanda Tangan', variant: 'primary' },
  { key: 'direksiLapangan', label: 'Direksi Lapangan', action: 'Minta Tanda Tangan', variant: 'primary' },
  { key: 'pengawasLapangan', label: 'Pengawas Lapangan', action: 'Lihat Tanda Tangan', variant: 'outline' },
];

export default function ITPSignaturePanel({ signatures, onRequest }) {
  return (
    <section className="itp-section-card">
      <h2 className="itp-section-title">Pengesahan (E-Signature)</h2>
      <div className="itp-signature-grid">
        {ITEMS.map((item) => (
          <div key={item.key} className="itp-signature-card">
            <span className="itp-signature-role">{item.label}</span>
            <div className="itp-signature-preview" aria-hidden="true">
              <PenLine size={32} strokeWidth={1.5} />
            </div>
            <button
              type="button"
              className={`itp-signature-btn itp-signature-btn--${item.variant}`}
              onClick={() => onRequest?.(item.key)}
            >
              {item.action}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
