import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, CircleAlert as AlertCircle } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers.js';
import UserTable from '../../components/admin/UserTable';
import UserFormModal from '../../components/admin/UserFormModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

const PAGE_SIZE = 10;

export default function AdminUserPage() {
  const { users, total, loading, error, fetchUsers, createUser, updateUser, deleteUser } = useUsers();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const offset = (page - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const refresh = useCallback(() => {
    fetchUsers(debouncedSearch, PAGE_SIZE, offset);
  }, [fetchUsers, debouncedSearch, offset]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async (data) => {
    setFormSubmitting(true);
    setFormError('');
    try {
      await createUser(data);
      setShowCreateModal(false);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!editingUser) return;
    setFormSubmitting(true);
    setFormError('');
    try {
      await updateUser(editingUser.$id, data);
      setEditingUser(null);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setFormSubmitting(true);
    setFormError('');
    try {
      await deleteUser(deletingUser.$id);
      setDeletingUser(null);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <>
      <div className="admin-section card">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Manajemen User</h2>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <UserPlus size={18} strokeWidth={2.5} />
            <span>Tambah User</span>
          </button>
        </div>

        <div className="admin-search-row">
          <div className="admin-search-field">
            <Search size={18} strokeWidth={2} className="admin-search-icon" />
            <input
              type="text"
              className="login-input admin-search-input"
              placeholder="Cari berdasarkan nama..."
              aria-label="Cari user berdasarkan nama"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="login-error" role="alert" style={{ margin: '0 0 1rem' }}>
            <AlertCircle size={16} strokeWidth={2.5} />
            <span>{error}</span>
          </div>
        )}

        <UserTable
          users={users}
          loading={loading}
          onEdit={setEditingUser}
          onDelete={setDeletingUser}
        />

        {totalPages > 1 && (
          <div className="admin-pagination">
            <span className="admin-pagination-info">
              Menampilkan {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} dari {total} user
            </span>
            <div className="admin-pagination-buttons">
              <button className="btn admin-pagination-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</button>
              <button className="btn admin-pagination-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Berikutnya</button>
            </div>
          </div>
        )}
      </div>

      <UserFormModal
        open={showCreateModal}
        user={null}
        onClose={() => { setShowCreateModal(false); setFormError(''); }}
        onSubmit={handleCreate}
        submitting={formSubmitting}
        externalError={formError}
      />

      <UserFormModal
        open={editingUser !== null}
        user={editingUser}
        onClose={() => { setEditingUser(null); setFormError(''); }}
        onSubmit={handleUpdate}
        submitting={formSubmitting}
        externalError={formError}
      />

      <DeleteConfirmModal
        open={deletingUser !== null}
        user={deletingUser}
        onClose={() => { setDeletingUser(null); setFormError(''); }}
        onConfirm={handleDelete}
        deleting={formSubmitting}
        error={formError}
      />
    </>
  );
}
