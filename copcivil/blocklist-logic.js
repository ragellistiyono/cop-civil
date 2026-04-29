/**
 * Validate a manual block request.
 * @param {{ip_address?: string, reason?: string}} body
 * @returns {{valid: boolean, error?: string}}
 */
export function validateBlockRequest(body) {
  if (!body.ip_address || !body.ip_address.trim()) {
    return { valid: false, error: 'Missing required field: ip_address' };
  }
  if (!body.reason || !body.reason.trim()) {
    return { valid: false, error: 'Missing required field: reason' };
  }
  return { valid: true };
}

/**
 * Validate an unblock request.
 * @param {{ip_address?: string}} body
 * @returns {{valid: boolean, error?: string}}
 */
export function validateUnblockRequest(body) {
  if (!body.ip_address || !body.ip_address.trim()) {
    return { valid: false, error: 'Missing required field: ip_address' };
  }
  return { valid: true };
}

/**
 * Build a block record for Appwrite DB insertion.
 * @param {string} ip
 * @param {string} reason
 * @param {string | null} expiresAt
 * @returns {object}
 */
export function buildBlockRecord(ip, reason, expiresAt) {
  return {
    ip_address: ip,
    reason,
    blocked_at: new Date().toISOString(),
    expires_at: expiresAt || null,
    block_type: 'manual',
    incident_count: 0,
    status: 'active',
  };
}
