import { useState } from 'react';
import { Save } from 'lucide-react';

const CONFIG_FIELDS = [
  {
    section: 'Ambang Batas Deteksi',
    fields: [
      { key: 'block_threshold', label: 'Ambang blokir', type: 'number', default: '15', helper: 'Skor >= nilai ini akan diblokir' },
      { key: 'warn_threshold', label: 'Ambang peringatan', type: 'number', default: '7', helper: 'Skor >= nilai ini akan diperingatkan' },
    ],
  },
  {
    section: 'Auto-Blokir',
    fields: [
      { key: 'auto_block_incident_count', label: 'Jumlah insiden untuk auto-blokir', type: 'number', default: '5' },
      { key: 'auto_block_window_minutes', label: 'Jendela waktu (menit)', type: 'number', default: '10' },
      { key: 'auto_block_duration_hours', label: 'Durasi blokir (jam)', type: 'number', default: '24' },
    ],
  },
  {
    section: 'AI Analytics',
    fields: [
      { key: 'openrouter_model', label: 'Model OpenRouter', type: 'text', default: 'anthropic/claude-sonnet-4', helper: 'Nama model dari OpenRouter (contoh: anthropic/claude-sonnet-4)' },
    ],
  },
  {
    section: 'IP Whitelist',
    fields: [
      { key: 'admin_whitelist_ips', label: 'Daftar IP Whitelist', type: 'textarea', default: '[]', helper: 'IP dalam daftar ini tidak akan diblokir secara otomatis. Format: JSON array, contoh: ["1.2.3.4", "5.6.7.8"]' },
    ],
  },
];

function getInitialValues(config) {
  const initial = {};
  for (const section of CONFIG_FIELDS) {
    for (const field of section.fields) {
      initial[field.key] = config[field.key]?.value ?? field.default;
    }
  }
  return initial;
}

export default function SecurityConfigForm({ config, onSave, saving }) {
  const [values, setValues] = useState(() => getInitialValues(config));
  const [dirty, setDirty] = useState(false);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(values);
    setDirty(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {CONFIG_FIELDS.map((section) => (
        <div key={section.section} className="security-form-section">
          <h3 className="security-form-section-title">{section.section}</h3>
          {section.fields.map((field) => (
            <div key={field.key} className="security-form-group">
              <label htmlFor={`config-${field.key}`}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={`config-${field.key}`}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={4}
                />
              ) : (
                <input
                  id={`config-${field.key}`}
                  type={field.type}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}
              {field.helper && <span className="security-form-helper">{field.helper}</span>}
            </div>
          ))}
        </div>
      ))}

      <button
        type="submit"
        className="security-btn security-btn--primary"
        disabled={!dirty || saving}
      >
        <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
      </button>
    </form>
  );
}
