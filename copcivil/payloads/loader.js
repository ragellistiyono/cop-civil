import { SEVERITY_ORDER } from '../shared/constants.js';

import sqliData from './sqli.json' with { type: 'json' };
import xssData from './xss.json' with { type: 'json' };
import cmdiData from './cmdi.json' with { type: 'json' };
import pathTraversalData from './path-traversal.json' with { type: 'json' };

const FILE_MAP = {
  'sqli': sqliData,
  'xss': xssData,
  'cmdi': cmdiData,
  'path-traversal': pathTraversalData,
};

/**
 * Validate a parsed pattern file object.
 * @param {object} file
 * @throws {Error} if validation fails
 */
export function validatePatternFile(file) {
  if (!file.category || typeof file.category !== 'string') {
    throw new Error('Invalid pattern file: missing or invalid "category"');
  }
  if (!Array.isArray(file.patterns)) {
    throw new Error('Invalid pattern file: missing or invalid "patterns" array');
  }

  for (let i = 0; i < file.patterns.length; i++) {
    const p = file.patterns[i];
    if (!p.id || typeof p.id !== 'string') {
      throw new Error(`Invalid pattern at index ${i}: missing or invalid "id"`);
    }
    if (!p.pattern || typeof p.pattern !== 'string') {
      throw new Error(`Invalid pattern at index ${i} (${p.id}): missing or invalid "pattern"`);
    }
    if (!p.severity || !SEVERITY_ORDER.includes(p.severity)) {
      throw new Error(
        `Invalid pattern at index ${i} (${p.id}): invalid "severity" "${p.severity}". Must be one of: ${SEVERITY_ORDER.join(', ')}`
      );
    }
  }
}

/**
 * Load and validate a single pattern file by category name.
 * Returns a flat array of pattern entries with category attached.
 * @param {'sqli' | 'xss' | 'cmdi' | 'path-traversal'} categoryName
 * @returns {import('../shared/types.js').PatternEntry[]}
 */
export function loadPatternFile(categoryName) {
  const data = FILE_MAP[categoryName];
  if (!data) {
    throw new Error(`Unknown pattern category: "${categoryName}"`);
  }

  validatePatternFile(data);

  return data.patterns.map((p) => ({
    id: p.id,
    pattern: p.pattern.toLowerCase(),
    severity: p.severity,
    category: data.category,
    description: p.description || '',
  }));
}

/**
 * Load all pattern files and return a merged flat array.
 * @returns {import('../shared/types.js').PatternEntry[]}
 */
export function loadAllPatterns() {
  const allPatterns = [];

  for (const categoryName of Object.keys(FILE_MAP)) {
    const patterns = loadPatternFile(categoryName);
    allPatterns.push(...patterns);
  }

  return allPatterns;
}
