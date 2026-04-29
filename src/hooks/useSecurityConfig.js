import { useState, useCallback } from 'react';
import { databases } from '../lib/appwrite.js';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_SECURITY_ID;
const COL_CONFIG = import.meta.env.VITE_APPWRITE_COLLECTION_SECURITY_CONFIG;

export function useSecurityConfig() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_CONFIG,
        queries: [Query.limit(100)],
      });

      const configMap = {};
      for (const doc of result.documents) {
        configMap[doc.key] = { value: doc.value, $id: doc.$id };
      }
      setConfig(configMap);
      return configMap;
    } catch (err) {
      setError(err.message);
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (key, value) => {
    setError(null);
    try {
      const current = config[key];
      if (!current) {
        throw new Error(`Config key "${key}" not found. Create it in Appwrite first.`);
      }

      await databases.updateDocument({
        databaseId: DB_ID,
        collectionId: COL_CONFIG,
        documentId: current.$id,
        data: { value: String(value) },
      });

      setConfig((prev) => ({
        ...prev,
        [key]: { ...prev[key], value: String(value) },
      }));

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [config]);

  return { config, loading, error, fetchConfig, updateConfig };
}
