import { useState, useCallback } from 'react';
import { databases, functions } from '../lib/appwrite.js';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_SECURITY_ID;
const COL_BLOCKLIST = import.meta.env.VITE_APPWRITE_COLLECTION_BLOCKLIST;
const FN_BLOCKLIST = import.meta.env.VITE_APPWRITE_FUNCTION_COPCIVIL_BLOCKLIST;

export function useBlocklist() {
  const [blocklist, setBlocklist] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlocklist = useCallback(async ({
    page = 1,
    limit = 25,
    status = 'active',
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.orderDesc('blocked_at'),
        Query.limit(limit),
        Query.offset((page - 1) * limit),
      ];

      if (status && status !== 'semua') {
        queries.push(Query.equal('status', status));
      }

      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_BLOCKLIST,
        queries,
      });

      setBlocklist(result.documents);
      setTotal(result.total);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveCount = useCallback(async () => {
    try {
      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_BLOCKLIST,
        queries: [Query.equal('status', 'active'), Query.limit(1)],
      });
      return result.total;
    } catch {
      return 0;
    }
  }, []);

  const blockIp = useCallback(async ({ ip_address, reason, expires_at }) => {
    setError(null);
    try {
      const execution = await functions.createExecution({
        functionId: FN_BLOCKLIST,
        body: JSON.stringify({ ip_address, reason, expires_at }),
        path: '/block',
        method: 'POST',
      });

      const response = JSON.parse(execution.responseBody);
      if (response.error) throw new Error(response.error);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const unblockIp = useCallback(async ({ ip_address, whitelist = false }) => {
    setError(null);
    try {
      const execution = await functions.createExecution({
        functionId: FN_BLOCKLIST,
        body: JSON.stringify({ ip_address, whitelist }),
        path: '/unblock',
        method: 'POST',
      });

      const response = JSON.parse(execution.responseBody);
      if (response.error) throw new Error(response.error);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const cleanupExpired = useCallback(async () => {
    setError(null);
    try {
      const execution = await functions.createExecution({
        functionId: FN_BLOCKLIST,
        body: '',
        path: '/cleanup',
        method: 'POST',
      });

      const response = JSON.parse(execution.responseBody);
      if (response.error) throw new Error(response.error);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    blocklist, total, loading, error,
    fetchBlocklist, fetchActiveCount, blockIp, unblockIp, cleanupExpired,
  };
}
