import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORY_COLORS = {
  sqli: '#3b82f6',
  xss: '#8b5cf6',
  cmdi: '#ef4444',
  path_traversal: '#f59e0b',
};

const CATEGORY_LABELS = {
  sqli: 'SQL Injection',
  xss: 'XSS',
  cmdi: 'Command Injection',
  path_traversal: 'Path Traversal',
};

export default function CategoryPieChart({ data }) {
  const chartData = Object.entries(data)
    .filter(([, count]) => count > 0)
    .map(([category, count]) => ({
      name: CATEGORY_LABELS[category] || category,
      value: count,
      color: CATEGORY_COLORS[category] || '#6b7280',
    }));

  if (chartData.length === 0) {
    return (
      <div className="security-chart-section">
        <h3 className="security-chart-title">Distribusi Kategori Serangan</h3>
        <p className="security-empty">Belum ada data insiden dalam 24 jam terakhir.</p>
      </div>
    );
  }

  return (
    <div className="security-chart-section">
      <h3 className="security-chart-title">Distribusi Kategori Serangan</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
