import { useState, useEffect } from 'react';
import { useSecurityConfig } from '../../hooks/useSecurityConfig.js';
import SecurityConfigForm from '../../components/admin/security/SecurityConfigForm.jsx';

export default function SecurityConfigPage() {
  const { config, loading, error, fetchConfig, updateConfig } = useSecurityConfig();
  const [saving, setSaving] = useState(false);
  const [configKey, setConfigKey] = useState(0);

  useEffect(() => {
    fetchConfig().then(() => setConfigKey((k) => k + 1));
  }, [fetchConfig]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const changedKeys = Object.keys(values).filter(
        (key) => config[key]?.value !== values[key]
      );

      for (const key of changedKeys) {
        await updateConfig(key, values[key]);
      }

      alert('Konfigurasi berhasil disimpan.');
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="security-loading">Memuat konfigurasi...</div>;
  }

  if (error) {
    return <div className="security-error">Gagal memuat konfigurasi: {error}</div>;
  }

  return (
    <div>
      <SecurityConfigForm key={configKey} config={config} onSave={handleSave} saving={saving} />
    </div>
  );
}
