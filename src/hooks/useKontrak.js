import { useState, useEffect, useMemo } from 'react';
import { KONTRAK_DATA } from '../data/kontrak.js';
import { databases, storage } from '../lib/appwrite.js';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_KONTRAK = import.meta.env.VITE_APPWRITE_COLLECTION_KONTRAK;
const COL_DOKUMEN = import.meta.env.VITE_APPWRITE_COLLECTION_DOKUMEN;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_KONTRAK;

const APPWRITE_CONFIGURED = !!(DB_ID && COL_KONTRAK && COL_DOKUMEN);

if (import.meta.env.DEV && !APPWRITE_CONFIGURED) {
  console.warn(
    '[useKontrak] Appwrite Database env vars not set. Using static fallback data. ' +
    'Set VITE_APPWRITE_DATABASE_ID, VITE_APPWRITE_COLLECTION_KONTRAK, and VITE_APPWRITE_COLLECTION_DOKUMEN to enable.'
  );
}

function getFileUrl(fileId) {
  if (!BUCKET_ID || !fileId) return null;
  return storage.getFileView({ bucketId: BUCKET_ID, fileId });
}

function mapAppwriteDoc(kontrakDoc, dokumenDocs) {
  return {
    id: kontrakDoc.$id,
    nomorKontrak: kontrakDoc.nomorKontrak,
    namaProyek: kontrakDoc.namaProyek,
    tanggal: kontrakDoc.tanggal,
    status: kontrakDoc.status,
    dokumen: dokumenDocs.map((d) => ({
      id: d.$id,
      tipe: d.tipe,
      nama: d.nama,
      path: d.sumber === 'lokal' ? d.path : getFileUrl(d.fileId),
      sumber: d.sumber,
      ukuran: null,
    })),
  };
}

export function useKontrakList() {
  const [kontrakList, setKontrakList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!APPWRITE_CONFIGURED) {
      setKontrakList(KONTRAK_DATA);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchFromAppwrite() {
      try {
        const kontrakResult = await databases.listDocuments({
          databaseId: DB_ID,
          collectionId: COL_KONTRAK,
          queries: [
            Query.orderDesc('$createdAt'),
            Query.limit(100),
          ],
        });

        const mapped = await Promise.all(
          kontrakResult.documents.map(async (k) => {
            const docsResult = await databases.listDocuments({
              databaseId: DB_ID,
              collectionId: COL_DOKUMEN,
              queries: [
                Query.equal('kontrakId', k.$id),
                Query.limit(100),
              ],
            });
            return mapAppwriteDoc(k, docsResult.documents);
          })
        );

        if (!cancelled) {
          setKontrakList(mapped);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useKontrakList] Appwrite fetch failed, using static fallback:', err.message);
          setKontrakList(KONTRAK_DATA);
          setError('Data ditampilkan dari cache lokal karena gagal terhubung ke server.');
          setLoading(false);
        }
      }
    }

    fetchFromAppwrite();
    return () => { cancelled = true; };
  }, []);

  return { kontrakList, loading, error };
}

export function useKontrakById(id) {
  const [kontrak, setKontrak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setKontrak(null);
      setLoading(false);
      return;
    }

    if (!APPWRITE_CONFIGURED) {
      const found = KONTRAK_DATA.find((k) => k.id === id) ?? null;
      setKontrak(found);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchFromAppwrite() {
      try {
        const doc = await databases.getDocument({
          databaseId: DB_ID,
          collectionId: COL_KONTRAK,
          documentId: id,
        });
        const docsResult = await databases.listDocuments({
          databaseId: DB_ID,
          collectionId: COL_DOKUMEN,
          queries: [
            Query.equal('kontrakId', id),
            Query.limit(100),
          ],
        });
        if (!cancelled) {
          setKontrak(mapAppwriteDoc(doc, docsResult.documents));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useKontrakById] Appwrite fetch failed, trying static fallback:', err.message);
          const found = KONTRAK_DATA.find((k) => k.id === id) ?? null;
          setKontrak(found);
          if (found) setError('Data ditampilkan dari cache lokal karena gagal terhubung ke server.');
          else setError('Kontrak tidak ditemukan.');
          setLoading(false);
        }
      }
    }

    fetchFromAppwrite();
    return () => { cancelled = true; };
  }, [id]);

  return { kontrak, loading, error };
}
