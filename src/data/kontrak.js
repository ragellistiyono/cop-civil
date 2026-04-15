export const STATUS_LABELS = {
  aktif: 'Aktif',
  selesai: 'Selesai',
  'dalam-proses': 'Dalam Proses',
};

export const KONTRAK_DATA = [
  {
    id: '002-pj-2025',
    nomorKontrak: '002.PJ.2025',
    namaProyek: 'Pekerjaan Sipil 002.PJ.2025',
    tanggal: '2025-01-01',
    status: 'aktif',
    dokumen: [
      {
        id: 'ad-002',
        tipe: 'approval-drawing',
        nama: 'Approval Drawing 002.PJ.2025',
        path: '/docs/kontrak/Kontrak 002.PJ.2025/Approval Drawing 002.PJ.2025.pdf',
        sumber: 'lokal',
        ukuran: null,
      },
      {
        id: 'boq-002',
        tipe: 'boq',
        nama: 'BOQ 002.PJ.2025',
        path: '/docs/kontrak/Kontrak 002.PJ.2025/BOQ 002.PJ.2025.pdf',
        sumber: 'lokal',
        ukuran: null,
      },
    ],
  },
  {
    id: '005-pj-2025',
    nomorKontrak: '005.PJ.2025',
    namaProyek: 'Pekerjaan Sipil 005.PJ.2025',
    tanggal: '2025-01-01',
    status: 'aktif',
    dokumen: [
      {
        id: 'ad-005',
        tipe: 'approval-drawing',
        nama: 'Approval Drawing 005.PJ.2025',
        path: '/docs/kontrak/Kontrak 005.PJ.2025/Approval Drawing 005.PJ.2025.pdf',
        sumber: 'lokal',
        ukuran: null,
      },
      {
        id: 'boq-005',
        tipe: 'boq',
        nama: 'BOQ 005.PJ.2025',
        path: '/docs/kontrak/Kontrak 005.PJ.2025/BOQ 005.2025.pdf',
        sumber: 'lokal',
        ukuran: null,
      },
    ],
  },
];
