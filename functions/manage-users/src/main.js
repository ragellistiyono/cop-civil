import { Client, Users, ID, Query } from 'node-appwrite';

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

function extractPathId(path) {
  const match = path.match(/^\/users\/([^/]+)$/);
  return match ? match[1] : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleListUsers(users, req) {
  const search = req.query?.search || '';
  const limit = Math.min(parseInt(req.query?.limit) || 25, 100);
  const offset = parseInt(req.query?.offset) || 0;

  const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')];
  if (search) queries.push(Query.search('name', search));

  const result = await users.list(queries);
  return {
    total: result.total,
    users: result.users.map((u) => ({
      $id: u.$id,
      name: u.name,
      email: u.email,
      labels: u.labels,
      status: u.status,
      registration: u.registration,
    })),
  };
}

async function handleCreateUser(users, req) {
  const { name, email, password, role } = parseBody(req);

  if (!name || !name.trim()) return { _status: 400, error: 'Nama wajib diisi.' };
  if (!email || !EMAIL_RE.test(email)) return { _status: 400, error: 'Format email tidak valid.' };
  if (!password || password.length < 8)
    return { _status: 400, error: 'Kata sandi harus minimal 8 karakter.' };
  if (!['admin', 'user'].includes(role))
    return { _status: 400, error: 'Role harus admin atau user.' };

  const user = await users.create(ID.unique(), email, undefined, password, name.trim());

  if (role === 'admin') {
    await users.updateLabels(user.$id, ['admin']);
  }

  const final = await users.get(user.$id);
  return {
    $id: final.$id,
    name: final.name,
    email: final.email,
    labels: final.labels,
    status: final.status,
    registration: final.registration,
  };
}

async function handleUpdateUser(users, userId, req) {
  const { name, role } = parseBody(req);

  let existing;
  try {
    existing = await users.get(userId);
  } catch {
    return { _status: 404, error: 'User tidak ditemukan.' };
  }

  if (name !== undefined && name.trim()) {
    await users.updateName(userId, name.trim());
  }

  if (role !== undefined) {
    if (!['admin', 'user'].includes(role))
      return { _status: 400, error: 'Role harus admin atau user.' };
    await users.updateLabels(userId, role === 'admin' ? ['admin'] : []);
  }

  const updated = await users.get(userId);
  return {
    $id: updated.$id,
    name: updated.name,
    email: updated.email,
    labels: updated.labels,
    status: updated.status,
    registration: updated.registration,
  };
}

async function handleDeleteUser(users, userId, req) {
  const callerId = req.headers['x-appwrite-user-id'];
  if (callerId === userId) {
    return { _status: 403, error: 'Tidak dapat menghapus akun sendiri.' };
  }

  try {
    await users.get(userId);
  } catch {
    return { _status: 404, error: 'User tidak ditemukan.' };
  }

  await users.delete(userId);
  return { success: true };
}

export default async ({ req, res, log, error }) => {
  try {
    const client = initClient();
    const users = new Users(client);

    const method = req.method;
    const path = req.path || '/';
    const userId = extractPathId(path);

    let result;

    if (path === '/users' && method === 'GET') {
      result = await handleListUsers(users, req);
    } else if (path === '/users' && method === 'POST') {
      result = await handleCreateUser(users, req);
    } else if (userId && method === 'PATCH') {
      result = await handleUpdateUser(users, userId, req);
    } else if (userId && method === 'DELETE') {
      result = await handleDeleteUser(users, userId, req);
    } else {
      return res.json({ error: 'Route tidak ditemukan.' }, 404);
    }

    const status = result._status || 200;
    if (result._status) delete result._status;
    return res.json(result, status);
  } catch (err) {
    error('Function error: ' + err.message);

    if (err.code === 409) {
      return res.json({ error: 'Email sudah terdaftar.' }, 409);
    }

    return res.json({ error: err.message || 'Terjadi kesalahan server.' }, 500);
  }
};
