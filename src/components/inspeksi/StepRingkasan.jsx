import { INSPEKSI_SCHEMA } from '../../data/inspeksiSchema.js';

function RingkasanField({ field, value, getPhotoUrl }) {
  if (field.type === 'photo') {
    const fileId = value?.fileId;
    if (!fileId) return <span className="inspeksi-ringkasan-empty">(tidak diisi)</span>;
    const url = getPhotoUrl(fileId);
    return (
      <div className="inspeksi-ringkasan-photo">
        <img src={url} alt={field.label} />
      </div>
    );
  }

  if (field.type === 'number') {
    const numVal = value?.value;
    if (numVal === '' || numVal === undefined || numVal === null) {
      return <span className="inspeksi-ringkasan-empty">—</span>;
    }
    return (
      <span>
        {numVal} {value?.unit || field.unit || ''}
      </span>
    );
  }

  if (field.type === 'select') {
    if (!value) return <span className="inspeksi-ringkasan-empty">—</span>;
    return <span>{value}</span>;
  }

  if (field.type === 'textarea') {
    if (!value) return <span className="inspeksi-ringkasan-empty">(tidak diisi)</span>;
    return <span className="inspeksi-ringkasan-text">{value}</span>;
  }

  return null;
}

export default function StepRingkasan({ formData, getPhotoUrl }) {
  const jenisPekerjaan = formData.jenisPekerjaan || [];

  return (
    <div className="step-content inspeksi-ringkasan">
      <h2 className="step-content-title">Ringkasan Laporan</h2>

      <div className="inspeksi-ringkasan-section">
        <h3 className="inspeksi-ringkasan-heading">Informasi Umum</h3>
        <div className="inspeksi-ringkasan-grid">
          <div className="inspeksi-ringkasan-item">
            <span className="inspeksi-ringkasan-label">Tanggal Inspeksi</span>
            <span>{formData.tanggalInspeksi || '—'}</span>
          </div>
          <div className="inspeksi-ringkasan-item">
            <span className="inspeksi-ringkasan-label">Lokasi / Nama GI</span>
            <span>{formData.lokasi || '—'}</span>
          </div>
          <div className="inspeksi-ringkasan-item">
            <span className="inspeksi-ringkasan-label">Jenis Pekerjaan</span>
            <span>{jenisPekerjaan.map((j) => INSPEKSI_SCHEMA[j]?.label || j).join(', ') || '—'}</span>
          </div>
        </div>
      </div>

      {jenisPekerjaan.map((jenisId) => {
        const schema = INSPEKSI_SCHEMA[jenisId];
        if (!schema) return null;
        const pekerjaanData = formData[jenisId] || {};

        return (
          <div key={jenisId} className="inspeksi-ringkasan-section">
            <h3 className="inspeksi-ringkasan-heading">{schema.label}</h3>

            {schema.sections.map((section) => {
              const sectionData = pekerjaanData[section.id] || {};

              return (
                <div key={section.id} className="inspeksi-ringkasan-subsection">
                  <h4 className="inspeksi-ringkasan-subheading">{section.label}</h4>
                  <div className="inspeksi-ringkasan-grid">
                    {section.fields.map((field) => (
                      <div key={field.id} className="inspeksi-ringkasan-item">
                        <span className="inspeksi-ringkasan-label">{field.label}</span>
                        <RingkasanField
                          field={field}
                          value={sectionData[field.id]}
                          getPhotoUrl={getPhotoUrl}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
