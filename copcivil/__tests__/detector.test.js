import { describe, it, expect } from 'vitest';
import { createDetector } from '../engine/detector.js';
import { ACTIONS } from '../shared/constants.js';

const TEST_PATTERNS = [
  { id: 'SQLI-001', pattern: 'union select', category: 'sqli', severity: 'high' },
  { id: 'SQLI-002', pattern: 'or 1=1', category: 'sqli', severity: 'medium' },
  { id: 'SQLI-003', pattern: 'drop table', category: 'sqli', severity: 'critical' },
  { id: 'XSS-001', pattern: '<script>', category: 'xss', severity: 'high' },
  { id: 'XSS-002', pattern: 'onerror=', category: 'xss', severity: 'medium' },
  { id: 'CMDI-001', pattern: '; ls', category: 'cmdi', severity: 'high' },
  { id: 'PT-001', pattern: '../../../', category: 'path_traversal', severity: 'high' },
];

describe('Detector', () => {
  describe('createDetector', () => {
    it('returns an object with a detect function', () => {
      const detector = createDetector(TEST_PATTERNS);
      expect(typeof detector.detect).toBe('function');
    });
  });

  describe('detect', () => {
    it('detects a plain SQL injection payload', () => {
      const detector = createDetector(TEST_PATTERNS);
      const result = detector.detect("id=1 UNION SELECT * FROM users");

      expect(result.action).toBe(ACTIONS.WARNED);
      expect(result.primaryCategory).toBe('sqli');
      expect(result.matches.length).toBeGreaterThanOrEqual(1);
      expect(result.matches.some(m => m.id === 'SQLI-001')).toBe(true);
    });

    it('detects URL-encoded XSS payload', () => {
      const detector = createDetector(TEST_PATTERNS);
      const result = detector.detect('%3Cscript%3Ealert(1)%3C%2Fscript%3E');

      expect(result.matches.some(m => m.id === 'XSS-001')).toBe(true);
      expect(result.primaryCategory).toBe('xss');
    });

    it('detects HTML entity encoded XSS', () => {
      const detector = createDetector(TEST_PATTERNS);
      const result = detector.detect('&#60;script&#62;alert(1)');

      expect(result.matches.some(m => m.id === 'XSS-001')).toBe(true);
    });

    it('detects SQL injection with comment evasion', () => {
      const detector = createDetector(TEST_PATTERNS);
      const result = detector.detect('UNI/**/ON SEL/**/ECT * FROM users');

      expect(result.matches.some(m => m.id === 'SQLI-001')).toBe(true);
    });

    it('detects case-evaded payloads', () => {
      const detector = createDetector(TEST_PATTERNS);
      const result = detector.detect('UnIoN SeLeCt * FROM users');

      expect(result.matches.some(m => m.id === 'SQLI-001')).toBe(true);
    });

    it('detects null-byte injection evasion', () => {
      const detector = createDetector(TEST_PATTERNS);
      const result = detector.detect('dro\x00p ta\x00ble users');

      expect(result.matches.some(m => m.id === 'SQLI-003')).toBe(true);
    });

    it('blocks high-threat combined payloads', () => {
      const detector = createDetector(TEST_PATTERNS);
      const result = detector.detect("1 UNION SELECT * FROM users; DROP TABLE accounts");

      expect(result.action).toBe(ACTIONS.BLOCKED);
      expect(result.score).toBeGreaterThanOrEqual(15);
    });

    it('returns logged for clean input', () => {
      const detector = createDetector(TEST_PATTERNS);
      const result = detector.detect('Hello, this is a normal search query');

      expect(result.action).toBe(ACTIONS.LOGGED);
      expect(result.score).toBe(0);
      expect(result.matches).toHaveLength(0);
    });

    it('includes normalized input in result', () => {
      const detector = createDetector(TEST_PATTERNS);
      const result = detector.detect('HELLO WORLD');

      expect(result.normalizedInput).toBe('hello world');
    });

    it('detects path traversal', () => {
      const detector = createDetector(TEST_PATTERNS);
      const result = detector.detect('../../../etc/passwd');

      expect(result.matches.some(m => m.id === 'PT-001')).toBe(true);
      expect(result.primaryCategory).toBe('path_traversal');
    });

    it('detects command injection', () => {
      const detector = createDetector(TEST_PATTERNS);
      const result = detector.detect('input; ls -la /etc');

      expect(result.matches.some(m => m.id === 'CMDI-001')).toBe(true);
      expect(result.primaryCategory).toBe('cmdi');
    });

    it('respects custom config thresholds', () => {
      const detector = createDetector(TEST_PATTERNS, {
        blockThreshold: 5,
        warnThreshold: 2,
      });
      const result = detector.detect('or 1=1');

      expect(result.action).toBe(ACTIONS.WARNED);
    });
  });
});
