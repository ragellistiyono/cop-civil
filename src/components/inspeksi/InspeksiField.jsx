import { useId } from 'react';
import PhotoUpload from './PhotoUpload';

export default function InspeksiField({ field, value, onChange, onPhotoUpload, onPhotoDelete, getPhotoUrl, disabled }) {
  const reactId = useId();
  const fieldId = `field-${field.id}-${reactId}`;

  if (field.type === 'photo') {
    const fileId = value?.fileId || '';
    return (
      <div className="inspeksi-field">
        <label className="login-label">{field.label}</label>
        <PhotoUpload
          value={fileId}
          onChange={(newFileId) => onChange({ fileId: newFileId })}
          onUpload={onPhotoUpload}
          onDelete={onPhotoDelete}
          getUrl={getPhotoUrl}
          disabled={disabled}
        />
      </div>
    );
  }

  if (field.type === 'number') {
    const numValue = value?.value ?? '';
    return (
      <div className="inspeksi-field">
        <label htmlFor={fieldId} className="login-label">{field.label}</label>
        <div className="inspeksi-field-number-row">
          <input
            id={fieldId}
            type="number"
            className="login-input"
            value={numValue}
            onChange={(e) => onChange({ value: e.target.value, unit: field.unit || '' })}
            disabled={disabled}
            placeholder="0"
            step="any"
          />
          {field.unit && (
            <span className="inspeksi-field-unit">{field.unit}</span>
          )}
        </div>
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="inspeksi-field">
        <label htmlFor={fieldId} className="login-label">{field.label}</label>
        <select
          id={fieldId}
          className="login-input admin-select"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">— Pilih —</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="inspeksi-field">
        <label htmlFor={fieldId} className="login-label">{field.label}</label>
        <textarea
          id={fieldId}
          className="login-input inspeksi-textarea"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="Tulis catatan..."
        />
      </div>
    );
  }

  return null;
}
