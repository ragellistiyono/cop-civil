import { describe, it, expect } from 'vitest';
import { loadAllPatterns, loadPatternFile, validatePatternFile } from '../payloads/loader.js';
import { CATEGORIES } from '../shared/constants.js';

describe('Payload Loader', () => {
  describe('validatePatternFile', () => {
    it('accepts a valid pattern file object', () => {
      const file = {
        category: 'sqli',
        description: 'Test',
        version: '1.0.0',
        patterns: [
          { id: 'T-001', pattern: 'test', severity: 'low', description: 'test' },
        ],
      };
      expect(() => validatePatternFile(file)).not.toThrow();
    });

    it('rejects missing category', () => {
      const file = { description: 'Test', version: '1.0.0', patterns: [] };
      expect(() => validatePatternFile(file)).toThrow('category');
    });

    it('rejects missing patterns array', () => {
      const file = { category: 'sqli', description: 'Test', version: '1.0.0' };
      expect(() => validatePatternFile(file)).toThrow('patterns');
    });

    it('rejects pattern without id', () => {
      const file = {
        category: 'sqli',
        description: 'Test',
        version: '1.0.0',
        patterns: [{ pattern: 'test', severity: 'low', description: 'x' }],
      };
      expect(() => validatePatternFile(file)).toThrow('id');
    });

    it('rejects pattern without pattern string', () => {
      const file = {
        category: 'sqli',
        description: 'Test',
        version: '1.0.0',
        patterns: [{ id: 'T-001', severity: 'low', description: 'x' }],
      };
      expect(() => validatePatternFile(file)).toThrow('pattern');
    });

    it('rejects invalid severity', () => {
      const file = {
        category: 'sqli',
        description: 'Test',
        version: '1.0.0',
        patterns: [{ id: 'T-001', pattern: 'test', severity: 'extreme', description: 'x' }],
      };
      expect(() => validatePatternFile(file)).toThrow('severity');
    });
  });

  describe('loadPatternFile', () => {
    it('loads and validates sqli.json', () => {
      const patterns = loadPatternFile('sqli');
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0]).toHaveProperty('id');
      expect(patterns[0]).toHaveProperty('pattern');
      expect(patterns[0]).toHaveProperty('severity');
      expect(patterns[0]).toHaveProperty('category');
      expect(patterns[0].category).toBe('sqli');
    });

    it('loads and validates xss.json', () => {
      const patterns = loadPatternFile('xss');
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every(p => p.category === 'xss')).toBe(true);
    });

    it('loads and validates cmdi.json', () => {
      const patterns = loadPatternFile('cmdi');
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every(p => p.category === 'cmdi')).toBe(true);
    });

    it('loads and validates path-traversal.json', () => {
      const patterns = loadPatternFile('path-traversal');
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every(p => p.category === 'path_traversal')).toBe(true);
    });
  });

  describe('loadAllPatterns', () => {
    it('loads patterns from all 4 categories', () => {
      const all = loadAllPatterns();
      const categories = [...new Set(all.map(p => p.category))];

      expect(categories).toContain(CATEGORIES.SQLI);
      expect(categories).toContain(CATEGORIES.XSS);
      expect(categories).toContain(CATEGORIES.CMDI);
      expect(categories).toContain(CATEGORIES.PATH_TRAVERSAL);
    });

    it('returns a flat array of pattern entries', () => {
      const all = loadAllPatterns();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThan(100);

      for (const p of all) {
        expect(p).toHaveProperty('id');
        expect(p).toHaveProperty('pattern');
        expect(p).toHaveProperty('severity');
        expect(p).toHaveProperty('category');
      }
    });

    it('has no duplicate pattern IDs', () => {
      const all = loadAllPatterns();
      const ids = all.map(p => p.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('all patterns are lowercase', () => {
      const all = loadAllPatterns();
      for (const p of all) {
        expect(p.pattern).toBe(p.pattern.toLowerCase());
      }
    });
  });
});
