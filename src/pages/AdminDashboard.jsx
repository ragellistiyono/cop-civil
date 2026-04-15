import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Plus, AlertCircle } from 'lucide-react';
import { useUsers } from '../hooks/useUsers.js';
import { useAdminKontrak } from '../hooks/useAdminKontrak.js';
import UserTable from '../components/admin/UserTable';
import UserFormModal from '../components/admin/UserFormModal';
import DeleteConfirmModal from '../components/admin/DeleteConfirmModal';
import KontrakAdminTable from '../components/admin/KontrakAdminTable';
import KontrakFormModal from '../components/admin/KontrakFormModal';
import DokumenManager from '../components/admin/DokumenManager';

const PAGE_SIZE = 10;

export default function AdminDashboard() {
  /* ---- User Management State ---- */
  const { users, total: userTotal, loading: userLoading, error: userError, fetchUsers, createUser, updateUser, deleteUser } = useUsers();

  const [userSearch, setUserSearch] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userFormSubmitting, setUserFormSubmitting] = useState(false);
  const [userFormError, setUserFormError] = useState('');

  const userOffset = (userPage - 1) * PAGE_SIZE;
  const userTotalPages = Math.ceil(userTotal / PAGE_SIZE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearch(userSearch);
      setUserPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const refreshUsers = useCallback(() => {
    fetchUsers(debouncedUserSearch, PAGE_SIZE, userOffset);
  }, [fetchUsers, debouncedUserSearch, userOffset]);

  useEffect(() => { refreshUsers(); }, [refreshUsers]);

  const handleCreateUser = async (data) => {
    setUserFormSubmitting(true);
    setUserFormError('');
    try {
      await createUser(data);
      setShowCreateUserModal(false);
      refreshUsers();
    } catch (err) {
      setUserFormError(err.message);
    } finally {
      setUserFormSubmitting(false);
    }
  };

  const handleUpdateUser = async (data) => {
    if (!editingUser) return;
    setUserFormSubmitting(true);
    setUserFormError('');
    try {
      await updateUser(editingUser.$id, data);
      setEditingUser(null);
      refreshUsers();
    } catch (err) {
      setUserFormError(err.message);
    } finally {
      setUserFormSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setUserFormSubmitting(true);
    setUserFormError('');
    try {
      await deleteUser(deletingUser.$id);
      setDeletingUser(null);
      refreshUsers();
    } catch (err) {
      setUserFormError(err.message);
    } finally {
      setUserFormSubmitting(false);
    }
  };

  /* ---- Kontrak Management State ---- */
  const adminKontrak = useAdminKontrak();
  const { kontrakList, total: kontrakTotal, loading: kontrakLoading, error: kontrakError, fetchKontrak, createKontrak, updateKontrak, deleteKontrak: deleteKontrakFn } = adminKontrak;

  const [kontrakSearch, setKontrakSearch] = useState('');
  const [debouncedKontrakSearch, setDebouncedKontrakSearch] = useState('');
  const [kontrakPage, setKontrakPage] = useState(1);
  const [showCreateKontrakModal, setShowCreateKontrakModal] = useState(false);
  const [editingKontrak, setEditingKontrak] = useState(null);
  const [deletingKontrak, setDeletingKontrak] = useState(null);
  const [dokumenKontrak, setDokumenKontrak] = useState(null);
  const [kontrakFormSubmitting, setKontrakFormSubmitting] = useState(false);
  const [kontrakFormError, setKontrakFormError] = useState('');

  const kontrakOffset = (kontrakPage - 1) * PAGE_SIZE;
  const kontrakTotalPages = Math.ceil(kontrakTotal / PAGE_SIZE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKontrakSearch(kontrakSearch);
      setKontrakPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [kontrakSearch]);

  const refreshKontrak = useCallback(() => {
    fetchKontrak(debouncedKontrakSearch, PAGE_SIZE, kontrakOffset);
  }, [fetchKontrak, debouncedKontrakSearch, kontrakOffset]);

  useEffect(() => { refreshKontrak(); }, [refreshKontrak]);

  const handleCreateKontrak = async (data) => {
    setKontrakFormSubmitting(true);
    setKontrakFormError('');
    try {
      await createKontrak(data);
      setShowCreateKontrakModal(false);
      refreshKontrak();
    } catch (err) {
      setKontrakFormError(err.message);
    } finally {
      setKontrakFormSubmitting(false);
    }
  };

  const handleUpdateKontrak = async (data) => {
    if (!editingKontrak) return;
    setKontrakFormSubmitting(true);
    setKontrakFormError('');
    try {
      await updateKontrak(editingKontrak.$id, data);
      setEditingKontrak(null);
      refreshKontrak();
    } catch (err) {
      setKontrakFormError(err.message);
    } finally {
      setKontrakFormSubmitting(false);
    }
  };

  const handleDeleteKontrak = async () => {
    if (!deletingKontrak) return;
    setKontrakFormSubmitting(true);
    setKontrakFormError('');
    try {
      await deleteKontrakFn(deletingKontrak.$id);
      setDeletingKontrak(null);
      refreshKontrak();
    } catch (err) {
      setKontrakFormError(err.message);
    } finally {
      setKontrakFormSubmitting(false);
    }
  };

  const handleDokumenRefresh = () => {
    refreshKontrak();
    if (dokumenKontrak) {
      const updated = kontrakList.find((k) => k.$id === dokumenKontrak.$id);
      if (updated) setDokumenKontrak(updated);
    }
  };

  useEffect(() => {
    if (dokumenKontrak) {
      const updated = kontrakList.find((k) => k.$id === dokumenKontrak.$id);
      if (updated) setDokumenKontrak(updated);
    }
  }, [kontrakList, dokumenKontrak]);

  return (
    <section className="section admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Dashboard Admin</h1>
          <p className="admin-subtitle">Manajemen Sistem CIVIL QTRACK UPT Malang</p>
        </div>

        {/* ---- User Management Section ---- */}
        <div className="admin-section card">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Manajemen User</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateUserModal(true)}>
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
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          {userError && (
            <div className="login-error" role="alert" style={{ margin: '0 0 1rem' }}>
              <AlertCircle size={16} strokeWidth={2.5} />
              <span>{userError}</span>
            </div>
          )}

          <UserTable
            users={users}
            loading={userLoading}
            onEdit={setEditingUser}
            onDelete={setDeletingUser}
          />

          {userTotalPages > 1 && (
            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Menampilkan {userOffset + 1}–{Math.min(userOffset + PAGE_SIZE, userTotal)} dari {userTotal} user
              </span>
              <div className="admin-pagination-buttons">
                <button
                  className="btn admin-pagination-btn"
                  disabled={userPage <= 1}
                  onClick={() => setUserPage((p) => p - 1)}
                >
                  Sebelumnya
                </button>
                <button
                  className="btn admin-pagination-btn"
                  disabled={userPage >= userTotalPages}
                  onClick={() => setUserPage((p) => p + 1)}
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---- Kontrak Management Section ---- */}
        <div className="admin-section card" style={{ marginTop: '2rem' }}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Manajemen Kontrak</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateKontrakModal(true)}>
              <Plus size={18} strokeWidth={2.5} />
              <span>Tambah Kontrak</span>
            </button>
          </div>

          <div className="admin-search-row">
            <div className="admin-search-field">
              <Search size={18} strokeWidth={2} className="admin-search-icon" />
              <input
                type="text"
                className="login-input admin-search-input"
                placeholder="Cari berdasarkan nama proyek..."
                aria-label="Cari kontrak berdasarkan nama proyek"
                value={kontrakSearch}
                onChange={(e) => setKontrakSearch(e.target.value)}
              />
            </div>
          </div>

          {kontrakError && (
            <div className="login-error" role="alert" style={{ margin: '0 0 1rem' }}>
              <AlertCircle size={16} strokeWidth={2.5} />
              <span>{kontrakError}</span>
            </div>
          )}

          <KontrakAdminTable
            kontrak={kontrakList}
            loading={kontrakLoading}
            onEdit={setEditingKontrak}
            onManageDocs={setDokumenKontrak}
            onDelete={setDeletingKontrak}
          />

          {kontrakTotalPages > 1 && (
            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Menampilkan {kontrakOffset + 1}–{Math.min(kontrakOffset + PAGE_SIZE, kontrakTotal)} dari {kontrakTotal} kontrak
              </span>
              <div className="admin-pagination-buttons">
                <button
                  className="btn admin-pagination-btn"
                  disabled={kontrakPage <= 1}
                  onClick={() => setKontrakPage((p) => p - 1)}
                >
                  Sebelumnya
                </button>
                <button
                  className="btn admin-pagination-btn"
                  disabled={kontrakPage >= kontrakTotalPages}
                  onClick={() => setKontrakPage((p) => p + 1)}
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- User Modals ---- */}
      <UserFormModal
        open={showCreateUserModal}
        user={null}
        onClose={() => { setShowCreateUserModal(false); setUserFormError(''); }}
        onSubmit={handleCreateUser}
        submitting={userFormSubmitting}
        externalError={userFormError}
      />

      <UserFormModal
        open={editingUser !== null}
        user={editingUser}
        onClose={() => { setEditingUser(null); setUserFormError(''); }}
        onSubmit={handleUpdateUser}
        submitting={userFormSubmitting}
        externalError={userFormError}
      />

      <DeleteConfirmModal
        open={deletingUser !== null}
        user={deletingUser}
        onClose={() => { setDeletingUser(null); setUserFormError(''); }}
        onConfirm={handleDeleteUser}
        deleting={userFormSubmitting}
        error={userFormError}
      />

      {/* ---- Kontrak Modals ---- */}
      <KontrakFormModal
        open={showCreateKontrakModal}
        kontrak={null}
        onClose={() => { setShowCreateKontrakModal(false); setKontrakFormError(''); }}
        onSubmit={handleCreateKontrak}
        submitting={kontrakFormSubmitting}
        externalError={kontrakFormError}
      />

      <KontrakFormModal
        open={editingKontrak !== null}
        kontrak={editingKontrak}
        onClose={() => { setEditingKontrak(null); setKontrakFormError(''); }}
        onSubmit={handleUpdateKontrak}
        submitting={kontrakFormSubmitting}
        externalError={kontrakFormError}
      />

      <DeleteConfirmModal
        open={deletingKontrak !== null}
        user={deletingKontrak ? { name: deletingKontrak.namaProyek, email: deletingKontrak.nomorKontrak } : null}
        onClose={() => { setDeletingKontrak(null); setKontrakFormError(''); }}
        onConfirm={handleDeleteKontrak}
        deleting={kontrakFormSubmitting}
        error={kontrakFormError}
      />

      <DokumenManager
        open={dokumenKontrak !== null}
        kontrak={dokumenKontrak}
        onClose={() => setDokumenKontrak(null)}
        onRefresh={handleDokumenRefresh}
        adminHook={adminKontrak}
      />
    </section>
  );
}
