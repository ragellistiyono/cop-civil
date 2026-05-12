const CATEGORY_LABELS = {
  sqli: 'SQL Injection',
  xss: 'XSS',
  cmdi: 'Command Injection',
  path_traversal: 'Path Traversal',
};

export default function CategoryBadge({ category }) {
  const label = CATEGORY_LABELS[category] || category;
  return (
    <span className={`security-badge security-badge--${category}`}>
      {label}
    </span>
  );
}
