const ACTION_LABELS = {
  blocked: 'Diblokir',
  warned: 'Diperingatkan',
  logged: 'Dicatat',
};

export default function ActionBadge({ action }) {
  const label = ACTION_LABELS[action] || action;
  return (
    <span className={`security-badge security-badge--${action}`}>
      {label}
    </span>
  );
}
