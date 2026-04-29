/**
 * Decode percent-encoded characters (URL decoding).
 * @param {string} input
 * @returns {string}
 */
export function urlDecode(input) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

/**
 * Apply URL decoding twice to catch double-encoded payloads.
 * @param {string} input
 * @returns {string}
 */
export function doubleDecode(input) {
  const first = urlDecode(input);
  return urlDecode(first);
}

/**
 * Decode HTML named and numeric (decimal + hex) entities.
 * @param {string} input
 * @returns {string}
 */
export function htmlEntityDecode(input) {
  const named = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };

  let result = input.replace(/&(lt|gt|amp|quot|apos|#39);/gi, (match) => {
    return named[match.toLowerCase()] || match;
  });

  result = result.replace(/&#(\d+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 10));
  });

  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });

  return result;
}

/**
 * Lowercase all characters.
 * @param {string} input
 * @returns {string}
 */
export function caseFold(input) {
  return input.toLowerCase();
}

/**
 * Remove SQL-style comments: block, line (--), and hash (#).
 * @param {string} input
 * @returns {string}
 */
export function stripSqlComments(input) {
  let result = input.replace(/\/\*[\s\S]*?\*\//g, '');
  result = result.replace(/--[^\n]*/g, '');
  result = result.replace(/#[^\n]*/g, '');
  return result;
}

/**
 * Collapse all whitespace sequences to a single space and trim.
 * @param {string} input
 * @returns {string}
 */
export function collapseWhitespace(input) {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Remove null bytes (\x00).
 * @param {string} input
 * @returns {string}
 */
export function stripNullBytes(input) {
  return input.replace(/\x00/g, '');
}

/**
 * Full normalization pipeline: null bytes → double decode → HTML entity decode
 * → case fold → SQL comment strip → whitespace collapse.
 * @param {string} input
 * @returns {string}
 */
export function normalize(input) {
  let result = input;
  result = stripNullBytes(result);
  result = doubleDecode(result);
  result = htmlEntityDecode(result);
  result = caseFold(result);
  result = stripSqlComments(result);
  result = collapseWhitespace(result);
  return result;
}
