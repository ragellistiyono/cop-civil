export const JENIS_PEKERJAAN = [
  { id: 'beton', label: 'Pekerjaan Beton' },
  { id: 'baja', label: 'Pekerjaan Baja' },
  { id: 'kayu', label: 'Pekerjaan Kayu' },
];

export const INSPEKSI_SCHEMA = {
  beton: {
    label: 'Pekerjaan Beton',
    sections: [
      {
        id: 'slumpTest',
        label: 'Slump Test',
        fields: [
          { id: 'suratJalan', label: 'Surat Jalan Mixer Truck (jika menggunakan beton ready mix)', type: 'photo' },
          { id: 'alatUji', label: 'Alat uji (kerucut, batang penusuk, alas)', type: 'photo' },
          { id: 'hasilPengukuran', label: 'Hasil Pengukuran Slump Test', type: 'number', unit: 'cm' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
      {
        id: 'penuanganBeton',
        label: 'Penuangan Beton (Placing)',
        fields: [
          { id: 'tinggiJatuh', label: 'Tinggi jatuh penuangan beton', type: 'number', unit: 'm' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
      {
        id: 'pemadatan',
        label: 'Pemadatan',
        fields: [
          { id: 'jumlahTitik', label: 'Jumlah titik pemadatan', type: 'number', unit: '' },
          { id: 'durasiTitik', label: 'Durasi pemadatan tiap titik', type: 'number', unit: 'detik' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
      {
        id: 'pengambilanSampel',
        label: 'Pengambilan Sampel',
        fields: [
          { id: 'jumlahSampel', label: 'Jumlah sampel', type: 'number', unit: '' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
      {
        id: 'curing',
        label: 'Curing',
        fields: [
          { id: 'jenisCuring', label: 'Jenis curing', type: 'select', options: ['penyiraman', 'genangan', 'terpal', 'curing compound'] },
          { id: 'durasiCuring', label: 'Durasi Curing', type: 'number', unit: 'hari' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
    ],
  },
  baja: {
    label: 'Pekerjaan Baja',
    sections: [
      {
        id: 'visualTesting',
        label: 'Visual Testing',
        fields: [
          { id: 'diameterTulangan', label: 'Diameter tulangan utama', type: 'number', unit: 'mm' },
          { id: 'jarakTulangan', label: 'Jarak tulangan', type: 'number', unit: 'cm' },
          { id: 'jarakSengkang', label: 'Jarak sengkang', type: 'number', unit: 'cm' },
          { id: 'kesesuaianGambar', label: 'Kesesuaian dengan gambar kerja', type: 'select', options: ['sesuai', 'tidak sesuai'] },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
      {
        id: 'torqueWrenchTest',
        label: 'Torque Wrench Test',
        fields: [
          { id: 'diameterBaut', label: 'Diameter baut', type: 'number', unit: 'mm' },
          { id: 'grade', label: 'Grade', type: 'number', unit: '' },
          { id: 'nilaiTorsi', label: 'Nilai torsi', type: 'number', unit: 'Nm' },
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
    ],
  },
  kayu: {
    label: 'Pekerjaan Kayu',
    sections: [
      {
        id: 'visualInspection',
        label: 'Visual Inspection',
        fields: [
          { id: 'dokumentasi', label: 'Dokumentasi pengujian', type: 'photo' },
          { id: 'catatan', label: 'Catatan', type: 'textarea' },
        ],
      },
    ],
  },
};

/**
 * Build an empty formData object for a given jenis pekerjaan.
 * Each field gets a default value based on its type.
 */
export function buildEmptyFormData(jenisIds) {
  const data = {};
  for (const jenisId of jenisIds) {
    const schema = INSPEKSI_SCHEMA[jenisId];
    if (!schema) continue;
    data[jenisId] = {};
    for (const section of schema.sections) {
      data[jenisId][section.id] = {};
      for (const field of section.fields) {
        if (field.type === 'photo') {
          data[jenisId][section.id][field.id] = { fileId: '' };
        } else if (field.type === 'number') {
          data[jenisId][section.id][field.id] = { value: '', unit: field.unit || '' };
        } else if (field.type === 'select') {
          data[jenisId][section.id][field.id] = '';
        } else {
          data[jenisId][section.id][field.id] = '';
        }
      }
    }
  }
  return data;
}
