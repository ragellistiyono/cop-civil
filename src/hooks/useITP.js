import { useState, useCallback } from 'react';
import { DUMMY_ITP, DUMMY_ITP_LIST, createEmptyITP } from '../data/dummyITP.js';

export function useITP() {
  const [itp, setItp] = useState(() => ({ ...DUMMY_ITP }));
  const [itpList, setItpList] = useState(DUMMY_ITP_LIST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchITP = useCallback(async (id) => {
    // TODO: Replace with supabase.from('itp').select().eq('id', id).maybeSingle()
    setLoading(true);
    setError(null);
    try {
      if (!id) setItp(createEmptyITP());
      else setItp({ ...DUMMY_ITP, id });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchITPList = useCallback(async () => {
    // TODO: Replace with supabase.from('itp').select().order('created_at', { ascending: false })
    setLoading(true);
    try {
      setItpList(DUMMY_ITP_LIST);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateField = useCallback((path, value) => {
    setItp((prev) => {
      const next = { ...prev };
      const keys = path.split('.');
      let cursor = next;
      for (let i = 0; i < keys.length - 1; i += 1) {
        cursor[keys[i]] = { ...cursor[keys[i]] };
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const saveDraft = useCallback(async (data) => {
    // TODO: Replace with supabase.from('itp').upsert({ ...data, status: 'draft' })
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setItp({ ...data, status: 'draft' });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const submitITP = useCallback(async (data) => {
    // TODO: Replace with supabase.from('itp').upsert({ ...data, status: 'submitted' })
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setItp({ ...data, status: 'submitted' });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteITP = useCallback(async (id) => {
    // TODO: Replace with supabase.from('itp').delete().eq('id', id)
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 200));
      setItpList((list) => list.filter((item) => item.id !== id));
      return { success: true };
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDokumen = useCallback(async (file) => {
    // TODO: Replace with supabase.storage.from('itp-docs').upload(path, file)
    return { url: URL.createObjectURL(file), name: file.name };
  }, []);

  const requestSignature = useCallback(async (role) => {
    // TODO: Replace with edge function call to notify signatory via email
    setItp((prev) => ({
      ...prev,
      signatures: {
        ...prev.signatures,
        [role]: { ...prev.signatures[role], requested: true },
      },
    }));
    return { success: true };
  }, []);

  return {
    itp,
    itpList,
    loading,
    error,
    setItp,
    fetchITP,
    fetchITPList,
    updateField,
    saveDraft,
    submitITP,
    deleteITP,
    uploadDokumen,
    requestSignature,
  };
}
