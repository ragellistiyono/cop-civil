import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * We test the guard's core logic functions in isolation
 * (not the Appwrite Function handler, which requires the runtime).
 * The handler is a thin wrapper around these functions.
 */

// Mock the detection engine to test guard logic independently
const mockDetect = vi.fn();
vi.mock('../engine/index.js', () => ({
  createDetector: () => ({ detect: mockDetect }),
}));

// We'll test the pure logic functions extracted from main.js
// Import after mocks are set up
const { buildIncidentRecord, shouldAutoBlock, extractClientIp, parseBody } = await import(
  '../guard-logic.js'
);

describe('Guard Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractClientIp', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const req = { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } };
      expect(extractClientIp(req)).toBe('1.2.3.4');
    });

    it('extracts IP from x-real-ip header', () => {
      const req = { headers: { 'x-real-ip': '10.0.0.1' } };
      expect(extractClientIp(req)).toBe('10.0.0.1');
    });

    it('returns "unknown" when no IP headers present', () => {
      const req = { headers: {} };
      expect(extractClientIp(req)).toBe('unknown');
    });

    it('trims whitespace from IP', () => {
      const req = { headers: { 'x-forwarded-for': '  1.2.3.4  ' } };
      expect(extractClientIp(req)).toBe('1.2.3.4');
    });
  });

  describe('parseBody', () => {
    it('parses JSON string body', () => {
      expect(parseBody('{"key": "value"}')).toEqual({ key: 'value' });
    });

    it('returns object body as-is', () => {
      const body = { key: 'value' };
      expect(parseBody(body)).toEqual({ key: 'value' });
    });

    it('returns empty object for empty string', () => {
      expect(parseBody('')).toEqual({});
    });

    it('returns empty object for invalid JSON', () => {
      expect(parseBody('not json')).toEqual({});
    });

    it('returns empty object for null/undefined', () => {
      expect(parseBody(null)).toEqual({});
      expect(parseBody(undefined)).toEqual({});
    });
  });

  describe('buildIncidentRecord', () => {
    it('builds a complete incident record', () => {
      const record = buildIncidentRecord({
        ip: '1.2.3.4',
        layer: 'function',
        url: 'https://example.com/api?id=1',
        method: 'GET',
        headers: { 'user-agent': 'TestBot' },
        bodySnippet: '{"id": "1 OR 1=1"}',
        detection: {
          action: 'blocked',
          score: 17,
          severity: 'high',
          primaryCategory: 'sqli',
          matches: [
            { id: 'SQLI-001', pattern: 'or 1=1', category: 'sqli', severity: 'high', position: 5 },
          ],
          matchCount: 1,
          categoryScores: { sqli: 7 },
        },
      });

      expect(record.ip_address).toBe('1.2.3.4');
      expect(record.layer).toBe('function');
      expect(record.request_url).toBe('https://example.com/api?id=1');
      expect(record.request_method).toBe('GET');
      expect(record.attack_category).toBe('sqli');
      expect(record.severity).toBe('high');
      expect(record.threat_score).toBe(17);
      expect(record.action_taken).toBe('blocked');
      expect(record.user_agent).toBe('TestBot');
      expect(record.matched_patterns).toContain('SQLI-001');
      expect(record.timestamp).toBeDefined();
    });

    it('truncates long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(3000);
      const record = buildIncidentRecord({
        ip: '1.2.3.4',
        layer: 'function',
        url: longUrl,
        method: 'GET',
        headers: {},
        bodySnippet: '',
        detection: {
          action: 'logged',
          score: 0,
          severity: null,
          primaryCategory: null,
          matches: [],
          matchCount: 0,
          categoryScores: {},
        },
      });

      expect(record.request_url.length).toBeLessThanOrEqual(2048);
    });
  });

  describe('shouldAutoBlock', () => {
    it('returns true when incident count exceeds threshold', () => {
      expect(shouldAutoBlock(5, { autoBlockIncidentCount: 5 })).toBe(true);
    });

    it('returns false when incident count is below threshold', () => {
      expect(shouldAutoBlock(3, { autoBlockIncidentCount: 5 })).toBe(false);
    });

    it('uses default threshold of 5', () => {
      expect(shouldAutoBlock(5, {})).toBe(true);
      expect(shouldAutoBlock(4, {})).toBe(false);
    });
  });
});
