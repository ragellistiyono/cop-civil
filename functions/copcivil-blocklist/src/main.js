import { Client, Databases, ID, Query } from 'node-appwrite';

/**
 * Copcivil Blocklist — IP Blocklist Management
 *
 * Routes:
 *   GET  /list     — List blocked IPs (paginated)
 *   POST /block    — Manually block an IP (admin only)
 *   POST /unblock  — Unblock or whitelist an IP (admin only)
 *   POST /cleanup  — Expire old auto-blocks
 */

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

const DB_ID = () => process.env.COPCIVIL_DATABASE_ID;
const BLOCKLIST_ID = () => process.env.COPCIVIL_COLLECTION_BLOCKLIST;

async function handleList(databases, req) {
  const status = req.query?.status || 'active';
  const limit = Math.min(parseInt(req.query?.limit) || 25, 100);
  const offset = parseInt(req.query?.offset) || 0;

  const queries = [
    Query.equal('status', status),
    Query.limit(limit),
    Query.offset(offset),
    Query.orderDesc('blocked_at'),
  ];

  const result = await databases.listDocuments(DB_ID(), BLOCKLIST_ID(), queries);

  return {
    total: result.total,
    blocklist: result.documents.map((d) => ({
      $id: d.$id,
      ip_address: d.ip_address,
      reason: d.reason,
      blocked_at: d.blocked_at,
      expires_at: d.expires_at,
      block_type: d.block_type,
      incident_count: d.incident_count,
      status: d.status,
    })),
  };
}

async function handleBlock(databases, req) {
  const body = parseBody(req);
  const { ip_address, reason, expires_at } = body;

  if (!ip_address || !ip_address.trim()) {
    return { _status: 400, error: 'Missing required field: ip_address' };
  }
  if (!reason || !reason.trim()) {
    return { _status: 400, error: 'Missing required field: reason' };
  }

  // Check if already blocked
  const existing = await databases.listDocuments(DB_ID(), BLOCKLIST_ID(), [
    Query.equal('ip_address', ip_address.trim()),
    Query.equal('status', 'active'),
    Query.limit(1),
  ]);

  if (existing.total > 0) {
    return { _status: 409, error: 'IP is already blocked.' };
  }

  const record = {
    ip_address: ip_address.trim(),
    reason: reason.trim(),
    blocked_at: new Date().toISOString(),
    expires_at: expires_at || null,
    block_type: 'manual',
    incident_count: 0,
    status: 'active',
  };

  const doc = await databases.createDocument(DB_ID(), BLOCKLIST_ID(), ID.unique(), record);

  return {
    $id: doc.$id,
    ...record,
  };
}

async function handleUnblock(databases, req) {
  const body = parseBody(req);
  const { ip_address, whitelist } = body;

  if (!ip_address || !ip_address.trim()) {
    return { _status: 400, error: 'Missing required field: ip_address' };
  }

  const existing = await databases.listDocuments(DB_ID(), BLOCKLIST_ID(), [
    Query.equal('ip_address', ip_address.trim()),
    Query.equal('status', 'active'),
    Query.limit(1),
  ]);

  if (existing.total === 0) {
    return { _status: 404, error: 'No active block found for this IP.' };
  }

  const newStatus = whitelist ? 'whitelisted' : 'expired';

  await databases.updateDocument(DB_ID(), BLOCKLIST_ID(), existing.documents[0].$id, {
    status: newStatus,
  });

  return { success: true, ip_address: ip_address.trim(), new_status: newStatus };
}

async function handleCleanup(databases, log) {
  const now = new Date().toISOString();

  const expired = await databases.listDocuments(DB_ID(), BLOCKLIST_ID(), [
    Query.equal('status', 'active'),
    Query.lessThan('expires_at', now),
    Query.isNotNull('expires_at'),
    Query.limit(100),
  ]);

  let cleaned = 0;
  for (const doc of expired.documents) {
    await databases.updateDocument(DB_ID(), BLOCKLIST_ID(), doc.$id, {
      status: 'expired',
    });
    cleaned++;
  }

  log(`[copcivil-blocklist] Cleaned up ${cleaned} expired blocks.`);
  return { cleaned, total_expired: expired.total };
}

export default async ({ req, res, log, error }) => {
  try {
    const client = initClient();
    const databases = new Databases(client);

    const method = req.method;
    const path = req.path || '/';

    let result;

    if (path === '/list' && method === 'GET') {
      result = await handleList(databases, req);
    } else if (path === '/block' && method === 'POST') {
      result = await handleBlock(databases, req);
    } else if (path === '/unblock' && method === 'POST') {
      result = await handleUnblock(databases, req);
    } else if (path === '/cleanup' && method === 'POST') {
      result = await handleCleanup(databases, log);
    } else {
      return res.json({ error: 'Route not found.' }, 404);
    }

    const status = result._status || 200;
    if (result._status) delete result._status;
    return res.json(result, status);
  } catch (err) {
    error('[copcivil-blocklist] Error: ' + err.message);
    return res.json({ error: err.message || 'Internal server error.' }, 500);
  }
};
