import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { INSPEKSI_SCHEMA } from '../../data/inspeksiSchema.js';
import InspeksiField from './InspeksiField';

export default function StepPekerjaan({ jenisPekerjaanId, formData, onChange, onPhotoUpload, onPhotoDelete, getPhotoUrl, disabled }) {
  const schema = INSPEKSI_SCHEMA[jenisPekerjaanId];
  const [openSections, setOpenSections] = useState(() =>
    schema ? Object.fromEntries(schema.sections.map((s) => [s.id, true])) : {}
  );

  if (!schema) return null;

  const pekerjaanData = formData[jenisPekerjaanId] || {};

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleFieldChange = (sectionId, fieldId, value) => {
    const updatedSection = {
      ...(pekerjaanData[sectionId] || {}),
      [fieldId]: value,
    };
    const updatedPekerjaan = {
      ...pekerjaanData,
      [sectionId]: updatedSection,
    };
    onChange({
      ...formData,
      [jenisPekerjaanId]: updatedPekerjaan,
    });
  };

  return (
    <div className="step-content">
      <h2 className="step-content-title">{schema.label}</h2>

      {schema.sections.map((section) => {
        const isOpen = openSections[section.id] !== false;
        const sectionData = pekerjaanData[section.id] || {};

        return (
          <div key={section.id} className="inspeksi-section-accordion">
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleSection(section.id)}
              aria-expanded={isOpen}
            >
              <span>{section.label}</span>
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isOpen && (
              <div className="accordion-content">
                {section.fields.map((field) => (
                  <InspeksiField
                    key={field.id}
                    field={field}
                    value={sectionData[field.id]}
                    onChange={(val) => handleFieldChange(section.id, field.id, val)}
                    onPhotoUpload={onPhotoUpload}
                    onPhotoDelete={onPhotoDelete}
                    getPhotoUrl={getPhotoUrl}
                    disabled={disabled}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
