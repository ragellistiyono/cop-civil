import ITPFieldIndicator from './ITPFieldIndicator';
import { LOKASI_OPTIONS, TIM_PENGAWAS_PRESETS } from '../../data/dummyITP.js';

export default function ITPGeneralInfo({ itp, onChange }) {
  const isValid = (v) => Boolean(v && String(v).trim().length > 0);

  return (
    <section className="itp-section-card">
      <h2 className="itp-section-title">General Information</h2>

      <div className="itp-field-grid">
        <div className="itp-field">
          <label className="itp-field-label" htmlFor="itp-no">ITP No:</label>
          <div className="itp-field-control">
            <input
              id="itp-no"
              type="text"
              className="itp-input"
              placeholder="ITP no no."
              value={itp.itpNo}
              onChange={(e) => onChange('itpNo', e.target.value)}
            />
            <ITPFieldIndicator valid={isValid(itp.itpNo)} />
          </div>
        </div>

        <div className="itp-field itp-field--full">
          <label className="itp-field-label" htmlFor="itp-judul">Judul Kontrak:</label>
          <div className="itp-field-control">
            <input
              id="itp-judul"
              type="text"
              className="itp-input"
              value={itp.judulKontrak}
              onChange={(e) => onChange('judulKontrak', e.target.value)}
            />
            <ITPFieldIndicator valid={isValid(itp.judulKontrak)} />
          </div>
        </div>

        <div className="itp-field">
          <label className="itp-field-label" htmlFor="itp-nomor">Nomor Kontrak:</label>
          <div className="itp-field-control">
            <ITPFieldIndicator required={!isValid(itp.nomorKontrak)} />
            <input
              id="itp-nomor"
              type="text"
              className="itp-input"
              placeholder="Nomor Kontrak"
              value={itp.nomorKontrak}
              onChange={(e) => onChange('nomorKontrak', e.target.value)}
            />
            <ITPFieldIndicator valid={isValid(itp.nomorKontrak)} />
          </div>
        </div>

        <div className="itp-field">
          <label className="itp-field-label" htmlFor="itp-lokasi">Lokasi:</label>
          <div className="itp-field-control">
            <ITPFieldIndicator required={!isValid(itp.lokasi)} />
            <select
              id="itp-lokasi"
              className="itp-input itp-select"
              value={itp.lokasi}
              onChange={(e) => onChange('lokasi', e.target.value)}
            >
              <option value="">Lokasi Pekerjaan</option>
              {LOKASI_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ITPFieldIndicator valid={isValid(itp.lokasi)} />
          </div>
        </div>

        <div className="itp-field">
          <label className="itp-field-label" htmlFor="itp-tanggal">
            Tanggal Pengecoran
          </label>
          <div className="itp-field-control">
            <ITPFieldIndicator required={!isValid(itp.tanggalPengecoran)} />
            <input
              id="itp-tanggal"
              type="date"
              className="itp-input"
              value={itp.tanggalPengecoran}
              onChange={(e) => onChange('tanggalPengecoran', e.target.value)}
            />
          </div>
        </div>

        <div className="itp-field itp-field--tim">
          <label className="itp-field-label" htmlFor="itp-tim-text">Tim Pengawas (Text areas)</label>
          <textarea
            id="itp-tim-text"
            className="itp-input itp-textarea"
            rows={3}
            placeholder="Tim Pengawas (Text areas)"
            value={itp.timPengawasText}
            onChange={(e) => onChange('timPengawasText', e.target.value)}
          />
        </div>

        <div className="itp-field">
          <label className="itp-field-label" htmlFor="itp-tim-preset">Tim Pengawas (Text areas)</label>
          <select
            id="itp-tim-preset"
            className="itp-input itp-select"
            value={itp.timPengawasPreset}
            onChange={(e) => onChange('timPengawasPreset', e.target.value)}
          >
            <option value="">...</option>
            {TIM_PENGAWAS_PRESETS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
