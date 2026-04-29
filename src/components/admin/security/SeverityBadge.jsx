const SEVERITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export default function SeverityBadge({ severity }) {
  const label = SEVERITY_LABELS[severity] || severity;
  return (
    <span className={`security-badge security-badge--${severity}`}>
      {label}
    </span>
  );
}
