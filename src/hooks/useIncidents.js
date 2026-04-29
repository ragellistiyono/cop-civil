import { useState, useCallback } from 'react';
import { databases } from '../lib/appwrite.js';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_SECURITY_ID;
const COL_INCIDENTS = import.meta.env.VITE_APPWRITE_COLLECTION_INCIDENTS;

export function useIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIncidents = useCallback(async ({
    page = 1,
    limit = 25,
    category = '',
    severity = '',
    action = '',
    ip = '',
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.orderDesc('timestamp'),
        Query.limit(limit),
        Query.offset((page - 1) * limit),
      ];

      if (category) queries.push(Query.equal('attack_category', category));
      if (severity) queries.push(Query.equal('severity', severity));
      if (action) queries.push(Query.equal('action_taken', action));
      if (ip) queries.push(Query.search('ip_address', ip));

      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_INCIDENTS,
        queries,
      });

      setIncidents(result.documents);
      setTotal(result.total);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [allResult, blockedResult] = await Promise.all([
        databases.listDocuments({
          databaseId: DB_ID,
          collectionId: COL_INCIDENTS,
          queries: [
            Query.greaterThan('timestamp', since24h),
            Query.limit(1),
          ],
        }),
        databases.listDocuments({
          databaseId: DB_ID,
          collectionId: COL_INCIDENTS,
          queries: [
            Query.greaterThan('timestamp', since24h),
            Query.equal('action_taken', 'blocked'),
            Query.limit(1),
          ],
        }),
      ]);

      const categoryQueries = ['sqli', 'xss', 'cmdi', 'path_traversal'];
      const categoryResults = await Promise.all(
        categoryQueries.map((cat) =>
          databases.listDocuments({
            databaseId: DB_ID,
            collectionId: COL_INCIDENTS,
            queries: [
              Query.greaterThan('timestamp', since24h),
              Query.equal('attack_category', cat),
              Query.limit(1),
            ],
          })
        )
      );

      const categoryBreakdown = {};
      categoryQueries.forEach((cat, i) => {
        categoryBreakdown[cat] = categoryResults[i].total;
      });

      return {
        total24h: allResult.total,
        blocked24h: blockedResult.total,
        categoryBreakdown,
      };
    } catch (err) {
      console.warn('[useIncidents] fetchStats failed:', err.message);
      return { total24h: 0, blocked24h: 0, categoryBreakdown: {} };
    }
  }, []);

  return { incidents, total, loading, error, fetchIncidents, fetchStats };
}
