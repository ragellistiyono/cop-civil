import { Pencil, Trash2 } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function RoleBadge({ labels }) {
  const isAdmin = labels?.includes('admin');
  return (
    <span className={`admin-role-badge ${isAdmin ? 'admin-role-badge--admin' : 'admin-role-badge--user'}`}>
      {isAdmin ? 'Admin' : 'Pegawai'}
    </span>
  );
}

export default function UserTable({ users, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="admin-table-loading">
        <div className="auth-loading-spinner" />
        <p>Memuat data user...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="admin-table-empty">
        <p>Belum ada user terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Terdaftar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.$id}>
              <td className="admin-table-name">{user.name || '-'}</td>
              <td className="admin-table-email">{user.email}</td>
              <td><RoleBadge labels={user.labels} /></td>
              <td className="admin-table-date">{formatDate(user.registration)}</td>
              <td className="admin-table-actions">
                <button
                  className="admin-action-btn"
                  onClick={() => onEdit(user)}
                  aria-label={`Edit ${user.name}`}
                >
                  <Pencil size={16} strokeWidth={2} />
                </button>
                <button
                  className="admin-action-btn admin-action-btn--danger"
                  onClick={() => onDelete(user)}
                  aria-label={`Hapus ${user.name}`}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
