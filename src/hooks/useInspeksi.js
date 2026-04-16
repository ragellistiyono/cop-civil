import { useState, useCallback } from 'react';
import { databases, storage, ID } from '../lib/appwrite.js';
import { Query, Permission, Role } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_INSPEKSI = import.meta.env.VITE_APPWRITE_COLLECTION_INSPEKSI;
const BUCKET_INSPEKSI = import.meta.env.VITE_APPWRITE_BUCKET_INSPEKSI;

if (import.meta.env.DEV && !DB_ID) {
  console.warn('[useInspeksi] VITE_APPWRITE_DATABASE_ID is not set.');
}
if (import.meta.env.DEV && !COL_INSPEKSI) {
  console.warn('[useInspeksi] VITE_APPWRITE_COLLECTION_INSPEKSI is not set.');
}
if (import.meta.env.DEV && !BUCKET_INSPEKSI) {
  console.warn('[useInspeksi] VITE_APPWRITE_BUCKET_INSPEKSI is not set.');
}

export function useInspeksi() {
  const [inspeksiList, setInspeksiList] = useState([]);
  const [total, setTotal] = useState(0);
  const [inspeksi, setInspeksi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInspeksiList = useCallback(async (userId = null, status = null, limit = 25, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset),
      ];
      if (userId) queries.push(Query.equal('userId', userId));
      if (status) queries.push(Query.equal('status', status));

      const result = await databases.listDocuments(DB_ID, COL_INSPEKSI, queries);
      setInspeksiList(result.documents);
      setTotal(result.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInspeksiById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await databases.getDocument(DB_ID, COL_INSPEKSI, id);
      setInspeksi(doc);
      return doc;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInspeksi = useCallback(async (data, userId) => {
    const doc = await databases.createDocument(
      DB_ID,
      COL_INSPEKSI,
      ID.unique(),
      {
        userId: data.userId,
        userName: data.userName,
        tanggalInspeksi: data.tanggalInspeksi,
        lokasi: data.lokasi,
        kontrakId: data.kontrakId || '',
        jenisPekerjaan: data.jenisPekerjaan.join(','),
        data: JSON.stringify(data.data),
        fotoIds: JSON.stringify(data.fotoIds || []),
        status: 'draft',
        submittedAt: '',
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.read(Role.label('admin')),
        Permission.delete(Role.label('admin')),
      ]
    );
    return doc;
  }, []);

  const updateInspeksi = useCallback(async (id, data) => {
    const updatePayload = {};
    if (data.tanggalInspeksi !== undefined) updatePayload.tanggalInspeksi = data.tanggalInspeksi;
    if (data.lokasi !== undefined) updatePayload.lokasi = data.lokasi;
    if (data.kontrakId !== undefined) updatePayload.kontrakId = data.kontrakId;
    if (data.jenisPekerjaan !== undefined) updatePayload.jenisPekerjaan = data.jenisPekerjaan.join(',');
    if (data.data !== undefined) updatePayload.data = JSON.stringify(data.data);
    if (data.fotoIds !== undefined) updatePayload.fotoIds = JSON.stringify(data.fotoIds);

    const doc = await databases.updateDocument(DB_ID, COL_INSPEKSI, id, updatePayload);
    return doc;
  }, []);

  const submitInspeksi = useCallback(async (id, data) => {
    const updatePayload = {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    if (data.tanggalInspeksi !== undefined) updatePayload.tanggalInspeksi = data.tanggalInspeksi;
    if (data.lokasi !== undefined) updatePayload.lokasi = data.lokasi;
    if (data.kontrakId !== undefined) updatePayload.kontrakId = data.kontrakId;
    if (data.jenisPekerjaan !== undefined) updatePayload.jenisPekerjaan = data.jenisPekerjaan.join(',');
    if (data.data !== undefined) updatePayload.data = JSON.stringify(data.data);
    if (data.fotoIds !== undefined) updatePayload.fotoIds = JSON.stringify(data.fotoIds);

    const doc = await databases.updateDocument(DB_ID, COL_INSPEKSI, id, updatePayload);
    return doc;
  }, []);

  const uploadPhoto = useCallback(async (file) => {
    const result = await storage.createFile(BUCKET_INSPEKSI, ID.unique(), file);
    return result.$id;
  }, []);

  const deletePhoto = useCallback(async (fileId) => {
    await storage.deleteFile(BUCKET_INSPEKSI, fileId);
  }, []);

  const getPhotoUrl = useCallback((fileId) => {
    if (!fileId) return null;
    return storage.getFileView(BUCKET_INSPEKSI, fileId);
  }, []);

  return {
    inspeksiList,
    total,
    inspeksi,
    loading,
    error,
    fetchInspeksiList,
    fetchInspeksiById,
    createInspeksi,
    updateInspeksi,
    submitInspeksi,
    uploadPhoto,
    deletePhoto,
    getPhotoUrl,
  };
}
