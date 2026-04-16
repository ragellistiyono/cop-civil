import { JENIS_PEKERJAAN } from '../../data/inspeksiSchema.js';

export default function StepInfoUmum({ formData, onChange, kontrakList }) {
  const handleChange = (key, value) => {
    onChange({ ...formData, [key]: value });
  };

  const handleJenisToggle = (jenisId) => {
    const current = formData.jenisPekerjaan || [];
    const updated = current.includes(jenisId)
      ? current.filter((j) => j !== jenisId)
      : [...current, jenisId];
    handleChange('jenisPekerjaan', updated);
  };

  return (
    <div className="step-content">
      <h2 className="step-content-title">Informasi Umum</h2>

      <div className="login-field">
        <label htmlFor="tanggalInspeksi" className="login-label">Tanggal Inspeksi</label>
        <input
          id="tanggalInspeksi"
          type="date"
          className="login-input"
          value={formData.tanggalInspeksi || ''}
          onChange={(e) => handleChange('tanggalInspeksi', e.target.value)}
          required
        />
      </div>

      <div className="login-field">
        <label htmlFor="lokasi" className="login-label">Lokasi / Nama GI</label>
        <input
          id="lokasi"
          type="text"
          className="login-input"
          placeholder="Contoh: GI Pakis 150 kV"
          value={formData.lokasi || ''}
          onChange={(e) => handleChange('lokasi', e.target.value)}
          required
        />
      </div>

      <div className="login-field">
        <label htmlFor="kontrakId" className="login-label">Kontrak Terkait (Opsional)</label>
        <select
          id="kontrakId"
          className="login-input admin-select"
          value={formData.kontrakId || ''}
          onChange={(e) => handleChange('kontrakId', e.target.value)}
        >
          <option value="">— Tidak ada —</option>
          {(kontrakList || []).map((k) => (
            <option key={k.id || k.$id} value={k.id || k.$id}>
              {k.nomorKontrak} — {k.namaProyek}
            </option>
          ))}
        </select>
      </div>

      <div className="login-field">
        <span className="login-label">Pilih Jenis Pekerjaan (minimal 1)</span>
        <div className="inspeksi-checkbox-group">
          {JENIS_PEKERJAAN.map((jenis) => (
            <label key={jenis.id} className="inspeksi-checkbox-item">
              <input
                type="checkbox"
                checked={(formData.jenisPekerjaan || []).includes(jenis.id)}
                onChange={() => handleJenisToggle(jenis.id)}
              />
              <span>{jenis.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
