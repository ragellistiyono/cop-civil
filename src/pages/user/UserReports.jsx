import { ChartBar as BarChart3 } from 'lucide-react';

export default function UserReports() {
  return (
    <div className="itp-dashboard">
      <h1 className="itp-dashboard-title">REPORTS</h1>
      <div className="itp-section-card itp-placeholder">
        <BarChart3 size={48} strokeWidth={1.5} />
        <p>Halaman laporan sedang dalam pengembangan.</p>
        <p className="itp-placeholder-hint">
          Di sini nantinya akan ditampilkan statistik ITP, grafik progres pekerjaan,
          dan ringkasan laporan inspeksi yang dapat diunduh.
        </p>
      </div>
    </div>
  );
}
