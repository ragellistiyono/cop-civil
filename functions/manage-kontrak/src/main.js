import { Client, Databases, Storage, ID, Query } from 'node-appwrite';

const DB_ID = () => process.env.APPWRITE_DATABASE_ID;
const COL_KONTRAK = () => process.env.APPWRITE_COLLECTION_KONTRAK;
const COL_DOKUMEN = () => process.env.APPWRITE_COLLECTION_DOKUMEN;
const BUCKET_KONTRAK = () => process.env.APPWRITE_BUCKET_KONTRAK;

function initClient() {
  return new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
}

function parseBody(req) {
  if (!req.body || req.body === '') return {};
  try {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return {};
  }
}

function matchRoute(path) {
  let match;

  match = path.match(/^\/kontrak\/([^/]+)\/dokumen$/);
  if (match) return { type: 'kontrak-dokumen', kontrakId: match[1] };

  match = path.match(/^\/kontrak\/([^/]+)$/);
  if (match) return { type: 'kontrak-id', id: match[1] };

  if (path === '/kontrak') return { type: 'kontrak' };

  match = path.match(/^\/dokumen\/([^/]+)$/);
  if (match) return { type: 'dokumen-id', id: match[1] };

  return { type: null };
}

const VALID_STATUS = ['aktif', 'selesai', 'dalam-proses'];
const VALID_TIPE = ['approval-drawing', 'boq', 'lainnya'];

async function handleListKontrak(databases, req) {
  const search = req.query?.search || '';
  const limit = Math.min(parseInt(req.query?.limit) || 25, 100);
  const offset = parseInt(req.query?.offset) || 0;

  const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')];
  if (search) queries.push(Query.search('namaProyek', search));

  const kontrakResult = await databases.listDocuments({
    databaseId: DB_ID(),
    collectionId: COL_KONTRAK(),
    queries,
  });

  const kontrakWithDocs = await Promise.all(
    kontrakResult.documents.map(async (k) => {
      const docsResult = await databases.listDocuments({
        databaseId: DB_ID(),
        collectionId: COL_DOKUMEN(),
        queries: [Query.equal('kontrakId', k.$id), Query.limit(100)],
      });
      return {
        $id: k.$id,
        nomorKontrak: k.nomorKontrak,
        namaProyek: k.namaProyek,
        tanggal: k.tanggal,
        status: k.status,
        dokumen: docsResult.documents.map((d) => ({
          $id: d.$id,
          tipe: d.tipe,
          nama: d.nama,
          fileId: d.fileId || null,
          path: d.path || null,
          sumber: d.sumber,
          kontrakId: d.kontrakId,
        })),
      };
    })
  );

  return { total: kontrakResult.total, kontrak: kontrakWithDocs };
}

async function handleCreateKontrak(databases, req) {
  const { nomorKontrak, namaProyek, tanggal, status } = parseBody(req);

  if (!nomorKontrak || !nomorKontrak.trim())
    return { _status: 400, error: 'Nomor kontrak wajib diisi.' };
  if (!namaProyek || !namaProyek.trim())
    return { _status: 400, error: 'Nama proyek wajib diisi.' };
  if (!tanggal) return { _status: 400, error: 'Tanggal wajib diisi.' };
  if (!VALID_STATUS.includes(status))
    return { _status: 400, error: 'Status harus aktif, selesai, atau dalam-proses.' };

  const doc = await databases.createDocument({
    databaseId: DB_ID(),
    collectionId: COL_KONTRAK(),
    documentId: ID.unique(),
    data: {
      nomorKontrak: nomorKontrak.trim(),
      namaProyek: namaProyek.trim(),
      tanggal,
      status,
    },
  });

  return {
    $id: doc.$id,
    nomorKontrak: doc.nomorKontrak,
    namaProyek: doc.namaProyek,
    tanggal: doc.tanggal,
    status: doc.status,
    dokumen: [],
  };
}

async function handleUpdateKontrak(databases, kontrakId, req) {
  try {
    await databases.getDocument({
      databaseId: DB_ID(),
      collectionId: COL_KONTRAK(),
      documentId: kontrakId,
    });
  } catch {
    return { _status: 404, error: 'Kontrak tidak ditemukan.' };
  }

  const body = parseBody(req);
  const data = {};
  if (body.nomorKontrak !== undefined && body.nomorKontrak.trim())
    data.nomorKontrak = body.nomorKontrak.trim();
  if (body.namaProyek !== undefined && body.namaProyek.trim())
    data.namaProyek = body.namaProyek.trim();
  if (body.tanggal !== undefined && body.tanggal.trim())
    data.tanggal = body.tanggal.trim();
  if (body.status !== undefined) {
    if (!VALID_STATUS.includes(body.status))
      return { _status: 400, error: 'Status harus aktif, selesai, atau dalam-proses.' };
    data.status = body.status;
  }

  const updated = await databases.updateDocument({
    databaseId: DB_ID(),
    collectionId: COL_KONTRAK(),
    documentId: kontrakId,
    data,
  });
  return {
    $id: updated.$id,
    nomorKontrak: updated.nomorKontrak,
    namaProyek: updated.namaProyek,
    tanggal: updated.tanggal,
    status: updated.status,
  };
}

async function handleDeleteKontrak(databases, storage, kontrakId) {
  try {
    await databases.getDocument({
      databaseId: DB_ID(),
      collectionId: COL_KONTRAK(),
      documentId: kontrakId,
    });
  } catch {
    return { _status: 404, error: 'Kontrak tidak ditemukan.' };
  }

  const docsResult = await databases.listDocuments({
    databaseId: DB_ID(),
    collectionId: COL_DOKUMEN(),
    queries: [Query.equal('kontrakId', kontrakId), Query.limit(500)],
  });

  for (const doc of docsResult.documents) {
    if (doc.sumber === 'appwrite' && doc.fileId) {
      try {
        await storage.deleteFile({ bucketId: BUCKET_KONTRAK(), fileId: doc.fileId });
      } catch {
        /* file may already be deleted */
      }
    }
    await databases.deleteDocument({
      databaseId: DB_ID(),
      collectionId: COL_DOKUMEN(),
      documentId: doc.$id,
    });
  }

  await databases.deleteDocument({
    databaseId: DB_ID(),
    collectionId: COL_KONTRAK(),
    documentId: kontrakId,
  });
  return { success: true };
}

async function handleAddDokumen(databases, kontrakId, req) {
  try {
    await databases.getDocument({
      databaseId: DB_ID(),
      collectionId: COL_KONTRAK(),
      documentId: kontrakId,
    });
  } catch {
    return { _status: 404, error: 'Kontrak tidak ditemukan.' };
  }

  const { tipe, nama, fileId, sumber } = parseBody(req);

  if (!nama || !nama.trim()) return { _status: 400, error: 'Nama dokumen wajib diisi.' };
  if (!VALID_TIPE.includes(tipe))
    return { _status: 400, error: 'Tipe harus approval-drawing, boq, atau lainnya.' };
  if (!['lokal', 'appwrite'].includes(sumber))
    return { _status: 400, error: 'Sumber harus lokal atau appwrite.' };
  if (sumber === 'appwrite' && !fileId)
    return { _status: 400, error: 'fileId wajib untuk sumber appwrite.' };

  const data = {
    kontrakId,
    tipe,
    nama: nama.trim(),
    sumber,
  };
  if (fileId) data.fileId = fileId;

  const doc = await databases.createDocument({
    databaseId: DB_ID(),
    collectionId: COL_DOKUMEN(),
    documentId: ID.unique(),
    data,
  });
  return {
    $id: doc.$id,
    tipe: doc.tipe,
    nama: doc.nama,
    fileId: doc.fileId || null,
    path: doc.path || null,
    sumber: doc.sumber,
    kontrakId: doc.kontrakId,
  };
}

async function handleDeleteDokumen(databases, storage, dokumenId) {
  let doc;
  try {
    doc = await databases.getDocument({
      databaseId: DB_ID(),
      collectionId: COL_DOKUMEN(),
      documentId: dokumenId,
    });
  } catch {
    return { _status: 404, error: 'Dokumen tidak ditemukan.' };
  }

  if (doc.sumber === 'lokal') {
    return { _status: 403, error: 'Dokumen lokal tidak dapat dihapus via admin.' };
  }

  if (doc.sumber === 'appwrite' && doc.fileId) {
    try {
      await storage.deleteFile({ bucketId: BUCKET_KONTRAK(), fileId: doc.fileId });
    } catch {
      /* file may already be deleted */
    }
  }

  await databases.deleteDocument({
    databaseId: DB_ID(),
    collectionId: COL_DOKUMEN(),
    documentId: dokumenId,
  });
  return { success: true };
}

export default async ({ req, res, log, error }) => {
  try {
    const client = initClient();
    const databases = new Databases(client);
    const storage = new Storage(client);

    const method = req.method;
    const path = req.path || '/';
    const route = matchRoute(path);

    let result;

    if (route.type === 'kontrak' && method === 'GET') {
      result = await handleListKontrak(databases, req);
    } else if (route.type === 'kontrak' && method === 'POST') {
      result = await handleCreateKontrak(databases, req);
    } else if (route.type === 'kontrak-id' && method === 'PATCH') {
      result = await handleUpdateKontrak(databases, route.id, req);
    } else if (route.type === 'kontrak-id' && method === 'DELETE') {
      result = await handleDeleteKontrak(databases, storage, route.id);
    } else if (route.type === 'kontrak-dokumen' && method === 'POST') {
      result = await handleAddDokumen(databases, route.kontrakId, req);
    } else if (route.type === 'dokumen-id' && method === 'DELETE') {
      result = await handleDeleteDokumen(databases, storage, route.id);
    } else {
      return res.json({ error: 'Route tidak ditemukan.' }, 404);
    }

    const status = result._status || 200;
    if (result._status) delete result._status;
    return res.json(result, status);
  } catch (err) {
    error('Function error: ' + err.message);
    return res.json({ error: err.message || 'Terjadi kesalahan server.' }, 500);
  }
};
