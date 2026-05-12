export const LOKASI_OPTIONS = [
  'Gardu Induk Malang',
  'Gardu Induk Kediri',
  'Gardu Induk Banyuwangi',
  'Gardu Induk Denpasar',
];

export const TIM_PENGAWAS_PRESETS = [
  'Tim Alpha',
  'Tim Bravo',
  'Tim Charlie',
];

export const PEMBONGKARAN_OPTIONS = [
  '12 Jam',
  '24 Jam',
  '36 Jam',
  '48 Jam',
];

export const JENIS_BESI_OPTIONS = ['ulir', 'polos'];

export function createEmptyITP() {
  return {
    id: null,
    itpNo: '',
    judulKontrak: 'Unit Induk Transmisi Jawa Bagian Timur dan Bali',
    nomorKontrak: '',
    lokasi: '',
    tanggalPengecoran: '',
    timPengawasText: '',
    timPengawasPreset: '',
    gambarKerja: [
      { id: 1, label: 'MB', url: '' },
      { id: 2, label: 'PILE', url: '' },
      { id: 3, label: 'PILE', url: '' },
    ],
    pemasanganTulangan: {
      ukuranBesi: '',
      jenisBesi: '',
      jarakSengkang: '',
      pemeriksaanBekisting: '',
      dokumentasi: [],
    },
    visualLapangan: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      url: '',
      timestamp: '',
    })),
    pekerjaanPengecoran: {
      slumpTest: '',
      sampleBendaUji: 0,
      sampleFotos: [],
      hammerTest: '',
      pembongkaranCetakan: '',
    },
    signatures: {
      direksiPekerjaan: { url: '', requested: false },
      direksiLapangan: { url: '', requested: false },
      pengawasLapangan: { url: '', requested: false },
    },
    status: 'draft',
  };
}

export const DUMMY_ITP = {
  ...createEmptyITP(),
  id: 'itp-001',
  itpNo: 'ITP-2026-001',
  nomorKontrak: 'KTR-001/2026',
  lokasi: 'Gardu Induk Malang',
  tanggalPengecoran: '2026-05-10',
  timPengawasText: 'Ir. Andi, Ir. Budi, Ir. Cahya',
  timPengawasPreset: 'Tim Alpha',
  pemasanganTulangan: {
    ukuranBesi: '16mm',
    jenisBesi: 'ulir',
    jarakSengkang: '15cm',
    pemeriksaanBekisting: 'sesuai',
    dokumentasi: [],
  },
  pekerjaanPengecoran: {
    slumpTest: '12cm',
    sampleBendaUji: 6,
    sampleFotos: [],
    hammerTest: '350 kg/cm2',
    pembongkaranCetakan: '24 Jam',
  },
};

export const DUMMY_ITP_LIST = [
  { id: 'itp-001', itpNo: 'ITP-2026-001', lokasi: 'Gardu Induk Malang', tanggalPengecoran: '2026-05-10', status: 'submitted' },
  { id: 'itp-002', itpNo: 'ITP-2026-002', lokasi: 'Gardu Induk Kediri', tanggalPengecoran: '2026-05-08', status: 'draft' },
  { id: 'itp-003', itpNo: 'ITP-2026-003', lokasi: 'Gardu Induk Denpasar', tanggalPengecoran: '2026-05-05', status: 'submitted' },
];
