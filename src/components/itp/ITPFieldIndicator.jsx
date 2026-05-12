import { Check } from 'lucide-react';

export default function ITPFieldIndicator({ required, valid }) {
  if (valid) {
    return (
      <span className="itp-indicator itp-indicator--valid" aria-label="Terisi">
        <Check size={12} strokeWidth={3} />
      </span>
    );
  }
  if (required) {
    return <span className="itp-indicator itp-indicator--required" aria-label="Wajib diisi" />;
  }
  return <span className="itp-indicator itp-indicator--empty" aria-hidden="true" />;
}
