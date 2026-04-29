import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, CircleAlert as AlertCircle } from 'lucide-react';
import { useAdminKontrak } from '../../hooks/useAdminKontrak.js';
import KontrakAdminTable from '../../components/admin/KontrakAdminTable';
import KontrakFormModal from '../../components/admin/KontrakFormModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import DokumenManager from '../../components/admin/DokumenManager';

const PAGE_SIZE = 10;

export default function AdminKontrakPage() {
  const adminKontrak = useAdminKontrak();
  const { kontrakList, total, loading, error, fetchKontrak, createKontrak, updateKontrak, deleteKontrak: deleteKontrakFn } = adminKontrak;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingKontrak, setEditingKontrak] = useState(null);
  const [deletingKontrak, setDeletingKontrak] = useState(null);
  const [dokumenKontrak, setDokumenKontrak] = useState(null);
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
    fetchKontrak(debouncedSearch, PAGE_SIZE, offset);
  }, [fetchKontrak, debouncedSearch, offset]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async (data) => {
    setFormSubmitting(true);
    setFormError('');
    try {
      await createKontrak(data);
      setShowCreateModal(false);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!editingKontrak) return;
    setFormSubmitting(true);
    setFormError('');
    try {
      await updateKontrak(editingKontrak.$id, data);
      setEditingKontrak(null);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingKontrak) return;
    setFormSubmitting(true);
    setFormError('');
    try {
      await deleteKontrakFn(deletingKontrak.$id);
      setDeletingKontrak(null);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  useEffect(() => {
    if (dokumenKontrak) {
      const updated = kontrakList.find((k) => k.$id === dokumenKontrak.$id);
      if (updated) setDokumenKontrak(updated);
    }
  }, [kontrakList, dokumenKontrak]);

  return (
    <>
      <div className="admin-section card">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Manajemen Kontrak</h2>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
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

        <KontrakAdminTable
          kontrak={kontrakList}
          loading={loading}
          onEdit={setEditingKontrak}
          onManageDocs={setDokumenKontrak}
          onDelete={setDeletingKontrak}
        />

        {totalPages > 1 && (
          <div className="admin-pagination">
            <span className="admin-pagination-info">
              Menampilkan {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} dari {total} kontrak
            </span>
            <div className="admin-pagination-buttons">
              <button className="btn admin-pagination-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</button>
              <button className="btn admin-pagination-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Berikutnya</button>
            </div>
          </div>
        )}
      </div>

      <KontrakFormModal
        open={showCreateModal}
        kontrak={null}
        onClose={() => { setShowCreateModal(false); setFormError(''); }}
        onSubmit={handleCreate}
        submitting={formSubmitting}
        externalError={formError}
      />

      <KontrakFormModal
        open={editingKontrak !== null}
        kontrak={editingKontrak}
        onClose={() => { setEditingKontrak(null); setFormError(''); }}
        onSubmit={handleUpdate}
        submitting={formSubmitting}
        externalError={formError}
      />

      <DeleteConfirmModal
        open={deletingKontrak !== null}
        user={deletingKontrak ? { name: deletingKontrak.namaProyek, email: deletingKontrak.nomorKontrak } : null}
        onClose={() => { setDeletingKontrak(null); setFormError(''); }}
        onConfirm={handleDelete}
        deleting={formSubmitting}
        error={formError}
        title="Hapus Kontrak"
        message={deletingKontrak ? (
          <>Apakah Anda yakin ingin menghapus kontrak <strong>{deletingKontrak.namaProyek}</strong> ({deletingKontrak.nomorKontrak})? Semua dokumen terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.</>
        ) : undefined}
        confirmLabel="Hapus Kontrak"
      />

      <DokumenManager
        open={dokumenKontrak !== null}
        kontrak={dokumenKontrak}
        onClose={() => setDokumenKontrak(null)}
        onRefresh={refresh}
        adminHook={adminKontrak}
      />
    </>
  );
}
