import { useState, useCallback } from 'react';
import { databases, ID } from '../lib/appwrite.js';
import { Query, Permission, Role } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_NOTIFIKASI = import.meta.env.VITE_APPWRITE_COLLECTION_NOTIFIKASI;

if (import.meta.env.DEV && !DB_ID) {
  console.warn('[useNotifikasi] VITE_APPWRITE_DATABASE_ID is not set.');
}
if (import.meta.env.DEV && !COL_NOTIFIKASI) {
  console.warn('[useNotifikasi] VITE_APPWRITE_COLLECTION_NOTIFIKASI is not set.');
}

export function useNotifikasi() {
  const [notifikasi, setNotifikasi] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifikasi = useCallback(async (limit = 20, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_NOTIFIKASI,
        queries: [
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset),
        ],
      });
      setNotifikasi(result.documents);
      return result.documents;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnreadCount = useCallback(async () => {
    try {
      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_NOTIFIKASI,
        queries: [Query.equal('read', false), Query.limit(1)],
      });
      setUnreadCount(result.total);
      return result.total;
    } catch (err) {
      console.warn('[useNotifikasi] Failed to get unread count:', err.message);
      return 0;
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await databases.updateDocument({
        databaseId: DB_ID,
        collectionId: COL_NOTIFIKASI,
        documentId: id,
        data: { read: true },
      });
      setNotifikasi((prev) =>
        prev.map((n) => (n.$id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('[useNotifikasi] Failed to mark as read:', err.message);
    }
  }, []);

  const createNotifikasi = useCallback(async (data) => {
    const doc = await databases.createDocument({
      databaseId: DB_ID,
      collectionId: COL_NOTIFIKASI,
      documentId: ID.unique(),
      data: {
        type: data.type,
        message: data.message,
        referenceId: data.referenceId,
        userId: data.userId,
        userName: data.userName,
        read: false,
        createdAt: new Date().toISOString(),
      },
      permissions: [
        Permission.read(Role.label('admin')),
        Permission.update(Role.label('admin')),
      ],
    });
    return doc;
  }, []);

  return {
    notifikasi,
    unreadCount,
    loading,
    error,
    fetchNotifikasi,
    getUnreadCount,
    markAsRead,
    createNotifikasi,
  };
}
