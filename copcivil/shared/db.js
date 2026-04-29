/**
 * Shared database constants and helpers for Appwrite Functions.
 * These read from Appwrite Function environment variables (process.env),
 * NOT from VITE_ prefixed vars.
 */

/**
 * Get database and collection IDs from Appwrite Function environment.
 * @returns {{databaseId: string, incidentsId: string, blocklistId: string, aiReportsId: string, configId: string}}
 */
export function getDbConfig() {
  return {
    databaseId: process.env.COPCIVIL_DATABASE_ID || '',
    incidentsId: process.env.COPCIVIL_COLLECTION_INCIDENTS || '',
    blocklistId: process.env.COPCIVIL_COLLECTION_BLOCKLIST || '',
    aiReportsId: process.env.COPCIVIL_COLLECTION_AI_REPORTS || '',
    configId: process.env.COPCIVIL_COLLECTION_SECURITY_CONFIG || '',
  };
}

/**
 * Truncate a string to a maximum length for safe DB storage.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

/**
 * Sanitize a string for safe DB storage (strip null bytes, control chars).
 * @param {string} str
 * @returns {string}
 */
export function sanitizeForStorage(str) {
  if (!str) return '';
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}
