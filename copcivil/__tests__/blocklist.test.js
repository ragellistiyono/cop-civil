import { describe, it, expect } from 'vitest';

/**
 * Test the blocklist helper functions.
 * The Appwrite handler itself requires the runtime — we test pure logic here.
 */
import { validateBlockRequest, validateUnblockRequest, buildBlockRecord } from '../blocklist-logic.js';

describe('Blocklist Logic', () => {
  describe('validateBlockRequest', () => {
    it('accepts a valid block request', () => {
      const result = validateBlockRequest({ ip_address: '1.2.3.4', reason: 'Manual block' });
      expect(result.valid).toBe(true);
    });

    it('rejects missing ip_address', () => {
      const result = validateBlockRequest({ reason: 'Test' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ip_address');
    });

    it('rejects missing reason', () => {
      const result = validateBlockRequest({ ip_address: '1.2.3.4' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reason');
    });

    it('rejects empty ip_address', () => {
      const result = validateBlockRequest({ ip_address: '', reason: 'Test' });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateUnblockRequest', () => {
    it('accepts a valid unblock request', () => {
      const result = validateUnblockRequest({ ip_address: '1.2.3.4' });
      expect(result.valid).toBe(true);
    });

    it('rejects missing ip_address', () => {
      const result = validateUnblockRequest({});
      expect(result.valid).toBe(false);
    });
  });

  describe('buildBlockRecord', () => {
    it('builds a manual block record', () => {
      const record = buildBlockRecord('1.2.3.4', 'Suspicious activity', null);
      expect(record.ip_address).toBe('1.2.3.4');
      expect(record.reason).toBe('Suspicious activity');
      expect(record.block_type).toBe('manual');
      expect(record.status).toBe('active');
      expect(record.expires_at).toBeNull();
      expect(record.incident_count).toBe(0);
    });

    it('builds a manual block record with expiry', () => {
      const expiresAt = '2026-12-31T23:59:59.000Z';
      const record = buildBlockRecord('1.2.3.4', 'Temp block', expiresAt);
      expect(record.expires_at).toBe(expiresAt);
    });
  });
});
