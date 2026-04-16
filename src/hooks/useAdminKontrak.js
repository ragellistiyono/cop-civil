import { useState, useCallback } from 'react';
import { functions, storage, ID } from '../lib/appwrite.js';

const FUNCTION_ID = import.meta.env.VITE_APPWRITE_FUNCTION_MANAGE_KONTRAK;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_KONTRAK;

if (import.meta.env.DEV && !FUNCTION_ID) {
  console.warn('[useAdminKontrak] VITE_APPWRITE_FUNCTION_MANAGE_KONTRAK is not set.');
}

if (import.meta.env.DEV && !BUCKET_ID) {
  console.warn('[useAdminKontrak] VITE_APPWRITE_BUCKET_KONTRAK is not set.');
}

async function callManageKontrak(method, path, body = null) {
  const params = {
    functionId: FUNCTION_ID,
    method,
    xpath: path,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) params.body = JSON.stringify(body);

  const execution = await functions.createExecution(params);

  let response;
  try {
    response = JSON.parse(execution.responseBody);
  } catch {
    throw new Error('Respons server tidak valid. Silakan coba lagi.');
  }

  if (execution.responseStatusCode >= 400) {
    throw new Error(response.error || 'Terjadi kesalahan.');
  }
  return response;
}

export function useAdminKontrak() {
  const [kontrakList, setKontrakList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchKontrak = useCallback(async (search = '', limit = 25, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      const qs = params.toString();
      const result = await callManageKontrak('GET', `/kontrak?${qs}`);
      setKontrakList(result.kontrak);
      setTotal(result.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createKontrak = useCallback(async (data) => {
    const result = await callManageKontrak('POST', '/kontrak', data);
    return result;
  }, []);

  const updateKontrak = useCallback(async (id, data) => {
    const result = await callManageKontrak('PATCH', `/kontrak/${id}`, data);
    return result;
  }, []);

  const deleteKontrak = useCallback(async (id) => {
    const result = await callManageKontrak('DELETE', `/kontrak/${id}`);
    return result;
  }, []);

  const addDokumen = useCallback(async (kontrakId, data) => {
    const result = await callManageKontrak('POST', `/kontrak/${kontrakId}/dokumen`, data);
    return result;
  }, []);

  const deleteDokumen = useCallback(async (id) => {
    const result = await callManageKontrak('DELETE', `/dokumen/${id}`);
    return result;
  }, []);

  const uploadFile = useCallback(async (file) => {
    const result = await storage.createFile({
      bucketId: BUCKET_ID,
      fileId: ID.unique(),
      file,
    });
    return result.$id;
  }, []);

  const deleteFile = useCallback(async (fileId) => {
    await storage.deleteFile({ bucketId: BUCKET_ID, fileId });
  }, []);

  const getFileUrl = useCallback((fileId) => {
    return storage.getFileView({ bucketId: BUCKET_ID, fileId });
  }, []);

  return {
    kontrakList,
    total,
    loading,
    error,
    fetchKontrak,
    createKontrak,
    updateKontrak,
    deleteKontrak,
    addDokumen,
    deleteDokumen,
    uploadFile,
    deleteFile,
    getFileUrl,
  };
}
