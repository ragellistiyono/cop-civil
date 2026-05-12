import { HardDrive, File } from 'lucide-react';

export default function ITPUploadSlot({ label = 'Upload File / GDrive Link', badge, onClick }) {
  return (
    <button type="button" className="itp-upload-slot" onClick={onClick}>
      <span className="itp-upload-slot-icon">
        <HardDrive size={18} strokeWidth={2} />
      </span>
      <span className="itp-upload-slot-label">{label}</span>
      {badge && (
        <span className="itp-upload-slot-badge">
          <File size={14} strokeWidth={2} />
          <span>{badge}</span>
        </span>
      )}
    </button>
  );
}
