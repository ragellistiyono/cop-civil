import { useState, useCallback } from 'react';
import { databases, functions } from '../lib/appwrite.js';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_SECURITY_ID;
const COL_REPORTS = import.meta.env.VITE_APPWRITE_COLLECTION_AI_REPORTS;
const FN_AI_REPORT = import.meta.env.VITE_APPWRITE_FUNCTION_COPCIVIL_AI_REPORT;

export function useAiReports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async ({ page = 1, limit = 10 } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: COL_REPORTS,
        queries: [
          Query.orderDesc('generated_at'),
          Query.limit(limit),
          Query.offset((page - 1) * limit),
        ],
      });

      setReports(result.documents);
      setTotal(result.total);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async ({ periodStart, periodEnd }) => {
    setGenerating(true);
    setError(null);
    try {
      const execution = await functions.createExecution({
        functionId: FN_AI_REPORT,
        body: JSON.stringify({
          period_start: periodStart,
          period_end: periodEnd,
        }),
        path: '/generate',
        method: 'POST',
      });

      const rawBody = execution?.responseBody ?? '';
      let response = null;

      if (typeof rawBody === 'string' && rawBody.trim() !== '') {
        try {
          response = JSON.parse(rawBody);
        } catch {
          const details = execution?.errors || 'Invalid JSON response from AI report function.';
          throw new Error(details);
        }
      }

      if (!response) {
        const details = execution?.errors || 'Empty response from AI report function.';
        throw new Error(details);
      }

      if (response.error) throw new Error(response.error);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { reports, total, loading, generating, error, fetchReports, generateReport };
}
