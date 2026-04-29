export default function StatCard({ label, value, color }) {
  return (
    <div className="security-stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <span className="security-stat-card-label">{label}</span>
      <span className="security-stat-card-value" style={{ color }}>
        {value ?? '—'}
      </span>
    </div>
  );
}
