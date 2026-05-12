import ITPFieldIndicator from './ITPFieldIndicator';
import ITPUploadSlot from './ITPUploadSlot';
import ITPPhotoGrid from './ITPPhotoGrid';
import { JENIS_BESI_OPTIONS, PEMBONGKARAN_OPTIONS } from '../../data/dummyITP.js';

export default function ITPTahapanGrid({ itp, onChange }) {
  const isValid = (v) => Boolean(v && String(v).trim().length > 0);
  const pt = itp.pemasanganTulangan;
  const pp = itp.pekerjaanPengecoran;

  return (
    <>
      <h2 className="itp-group-title">TAHAPAN PEKERJAAN</h2>

      <div className="itp-tahapan-grid">
        {/* Gambar Kerja */}
        <section className="itp-section-card">
          <h3 className="itp-section-title">Gambar Kerja &amp; Persiapan</h3>
          <div className="itp-upload-list">
            {itp.gambarKerja.map((item) => (
              <ITPUploadSlot key={item.id} badge={item.label} />
            ))}
          </div>
        </section>

        {/* Pemasangan Tulangan */}
        <section className="itp-section-card">
          <h3 className="itp-section-title">Pemasangan Tulangan &amp; Bekisting</h3>

          <div className="itp-tahapan-field">
            <div className="itp-tahapan-label">
              <span className="itp-tahapan-label-main">Ukuran Besi</span>
              
            </div>
            <div className="itp-field-control">
              <input
                type="text"
                className="itp-input"
                placeholder="16mm"
                value={pt.ukuranBesi}
                onChange={(e) => onChange('pemasanganTulangan.ukuranBesi', e.target.value)}
              />
              <ITPFieldIndicator valid={isValid(pt.ukuranBesi)} />
            </div>
          </div>

          <div className="itp-tahapan-field">
            <div className="itp-tahapan-label">
              <span className="itp-tahapan-label-main">Jenis Besi</span>
            </div>
            <div className="itp-field-control">
              <ITPFieldIndicator required={!isValid(pt.jenisBesi)} />
              <select
                className="itp-input itp-select"
                value={pt.jenisBesi}
                onChange={(e) => onChange('pemasanganTulangan.jenisBesi', e.target.value)}
              >
                <option value="">ulir/polos</option>
                {JENIS_BESI_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <ITPFieldIndicator valid={isValid(pt.jenisBesi)} />
            </div>
          </div>

          <div className="itp-tahapan-field">
            <div className="itp-tahapan-label">
              <span className="itp-tahapan-label-main">Jarak Sengkang</span>
            </div>
            <div className="itp-field-control">
              <input
                type="text"
                className="itp-input"
                placeholder="15cm"
                value={pt.jarakSengkang}
                onChange={(e) => onChange('pemasanganTulangan.jarakSengkang', e.target.value)}
              />
              <ITPFieldIndicator valid={isValid(pt.jarakSengkang)} />
            </div>
          </div>

          <div className="itp-tahapan-field">
            <div className="itp-tahapan-label">
              <span className="itp-tahapan-label-main">Pemeriksaan Bekisting</span>
            </div>
            <div className="itp-radio-group">
              <label className="itp-radio">
                <input
                  type="radio"
                  name="pemeriksaan-bekisting"
                  value="sesuai"
                  checked={pt.pemeriksaanBekisting === 'sesuai'}
                  onChange={(e) => onChange('pemasanganTulangan.pemeriksaanBekisting', e.target.value)}
                />
                <span>Sesuai</span>
              </label>
              <label className="itp-radio">
                <input
                  type="radio"
                  name="pemeriksaan-bekisting"
                  value="tidak"
                  checked={pt.pemeriksaanBekisting === 'tidak'}
                  onChange={(e) => onChange('pemasanganTulangan.pemeriksaanBekisting', e.target.value)}
                />
                <span>Tidak Sesuai</span>
              </label>
            </div>
          </div>

          <div className="itp-tahapan-field">
            <div className="itp-tahapan-label">
              <span className="itp-tahapan-label-main">Dokumentasi</span>
            </div>
            <ITPUploadSlot label="Upload File / GDrive Upload" />
          </div>
        </section>

        {/* Visual Lapangan */}
        <section className="itp-section-card">
          <h3 className="itp-section-title">Visual di Lapangan</h3>
          <ITPPhotoGrid photos={itp.visualLapangan} onAdd={() => { /* dummy */ }} />
        </section>

        {/* Pekerjaan Pengecoran */}
        <section className="itp-section-card">
          <h3 className="itp-section-title">Pekerjaan Pengecoran</h3>

          <div className="itp-tahapan-field">
            <div className="itp-tahapan-label">
              <span className="itp-tahapan-label-main">Slump Test</span>
            </div>
            <div className="itp-field-control">
              <input
                type="text"
                className="itp-input"
                placeholder="12cm"
                value={pp.slumpTest}
                onChange={(e) => onChange('pekerjaanPengecoran.slumpTest', e.target.value)}
              />
              <ITPFieldIndicator valid={isValid(pp.slumpTest)} />
            </div>
          </div>

          <div className="itp-tahapan-field">
            <div className="itp-tahapan-label">
              <span className="itp-tahapan-label-main">Sample Benda Uji</span>
            </div>
            <div className="itp-field-control itp-counter-row">
              <ITPFieldIndicator required={!Number(pp.sampleBendaUji)} />
              <input
                type="number"
                className="itp-input itp-input--counter"
                min="0"
                value={pp.sampleBendaUji}
                onChange={(e) => onChange('pekerjaanPengecoran.sampleBendaUji', Number(e.target.value))}
              />
              <span className="itp-counter-unit">pcs,</span>
              <button type="button" className="itp-counter-btn">+ Foto</button>
            </div>
          </div>

          <div className="itp-tahapan-field">
            <div className="itp-tahapan-label">
              <span className="itp-tahapan-label-main">Hammer Test Hasil</span>
            </div>
            <div className="itp-field-control">
              <ITPFieldIndicator required={!isValid(pp.hammerTest)} />
              <input
                type="text"
                className="itp-input"
                placeholder="350 kg/cm2"
                value={pp.hammerTest}
                onChange={(e) => onChange('pekerjaanPengecoran.hammerTest', e.target.value)}
              />
              <ITPFieldIndicator valid={isValid(pp.hammerTest)} />
            </div>
          </div>

          <div className="itp-tahapan-field">
            <div className="itp-tahapan-label">
              <span className="itp-tahapan-label-main">Pembongkaran Cetakan</span>
              <span className="itp-tahapan-label-sub">12 Jam, 24 Jam...</span>
            </div>
            <select
              className="itp-input itp-select"
              value={pp.pembongkaranCetakan}
              onChange={(e) => onChange('pekerjaanPengecoran.pembongkaranCetakan', e.target.value)}
            >
              <option value="">12 Jam, 24 Jam...</option>
              {PEMBONGKARAN_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </section>
      </div>
    </>
  );
}
