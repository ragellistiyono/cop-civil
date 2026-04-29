import { describe, it, expect } from 'vitest';
import {
  extractIpFromRequest,
  extractScanTargets,
  isStaticAsset,
  buildBlockedResponse,
  buildLogPayload,
  shouldRefreshBlocklist,
} from '../edge-logic.js';

describe('Edge Logic', () => {
  describe('extractIpFromRequest', () => {
    it('extracts IP from x-nf-client-connection-ip header', () => {
      const headers = new Map([['x-nf-client-connection-ip', '203.0.113.50']]);
      expect(extractIpFromRequest(headers)).toBe('203.0.113.50');
    });

    it('falls back to x-forwarded-for', () => {
      const headers = new Map([['x-forwarded-for', '10.0.0.1, 192.168.1.1']]);
      expect(extractIpFromRequest(headers)).toBe('10.0.0.1');
    });

    it('returns "unknown" when no IP headers', () => {
      const headers = new Map();
      expect(extractIpFromRequest(headers)).toBe('unknown');
    });

    it('trims whitespace', () => {
      const headers = new Map([['x-nf-client-connection-ip', '  10.0.0.1  ']]);
      expect(extractIpFromRequest(headers)).toBe('10.0.0.1');
    });
  });

  describe('extractScanTargets', () => {
    it('extracts URL path and query params', () => {
      const url = new URL('https://example.com/api/users?id=1&name=test');
      const headers = new Map([['cookie', 'session=abc123']]);
      const targets = extractScanTargets(url, headers);

      expect(targets).toContain('/api/users');
      expect(targets).toContain('id=1');
      expect(targets).toContain('name=test');
      expect(targets).toContain('session=abc123');
    });

    it('handles URL with no query params', () => {
      const url = new URL('https://example.com/page');
      const headers = new Map();
      const targets = extractScanTargets(url, headers);

      expect(targets).toContain('/page');
    });

    it('includes referer header if present', () => {
      const url = new URL('https://example.com/');
      const headers = new Map([['referer', 'https://evil.com/<script>']]);
      const targets = extractScanTargets(url, headers);

      expect(targets).toContain('https://evil.com/<script>');
    });
  });

  describe('isStaticAsset', () => {
    it('returns true for .js files', () => {
      expect(isStaticAsset('/assets/main.js')).toBe(true);
    });

    it('returns true for .css files', () => {
      expect(isStaticAsset('/styles/app.css')).toBe(true);
    });

    it('returns true for image files', () => {
      expect(isStaticAsset('/images/logo.png')).toBe(true);
      expect(isStaticAsset('/images/photo.jpg')).toBe(true);
      expect(isStaticAsset('/images/icon.svg')).toBe(true);
      expect(isStaticAsset('/images/banner.webp')).toBe(true);
    });

    it('returns true for font files', () => {
      expect(isStaticAsset('/fonts/inter.woff2')).toBe(true);
    });

    it('returns false for HTML pages', () => {
      expect(isStaticAsset('/about')).toBe(false);
      expect(isStaticAsset('/api/users')).toBe(false);
    });

    it('returns false for root path', () => {
      expect(isStaticAsset('/')).toBe(false);
    });

    it('returns true for favicon', () => {
      expect(isStaticAsset('/favicon.ico')).toBe(true);
    });
  });

  describe('buildBlockedResponse', () => {
    it('returns a 403 response object', () => {
      const resp = buildBlockedResponse('1.2.3.4', 'Blocked by copcivil');
      expect(resp.status).toBe(403);
      expect(resp.body).toContain('403');
      expect(resp.body).toContain('copcivil');
      expect(resp.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('buildLogPayload', () => {
    it('builds a complete log payload for the guard function', () => {
      const payload = buildLogPayload({
        ip: '1.2.3.4',
        url: 'https://example.com/api?id=1 OR 1=1',
        method: 'GET',
        userAgent: 'Mozilla/5.0',
        detection: {
          action: 'blocked',
          score: 17,
          severity: 'high',
          primaryCategory: 'sqli',
          matches: [{ id: 'SQLI-001', pattern: 'or 1=1', category: 'sqli', severity: 'high', position: 5 }],
          matchCount: 1,
        },
      });

      expect(payload.ip_address).toBe('1.2.3.4');
      expect(payload.layer).toBe('edge');
      expect(payload.action_taken).toBe('blocked');
      expect(payload.attack_category).toBe('sqli');
      expect(payload.threat_score).toBe(17);
      expect(payload.user_agent).toBe('Mozilla/5.0');
    });
  });

  describe('shouldRefreshBlocklist', () => {
    it('returns true when lastRefresh is null', () => {
      expect(shouldRefreshBlocklist(null, 300000)).toBe(true);
    });

    it('returns true when interval has passed', () => {
      const old = Date.now() - 400000;
      expect(shouldRefreshBlocklist(old, 300000)).toBe(true);
    });

    it('returns false when within interval', () => {
      const recent = Date.now() - 100000;
      expect(shouldRefreshBlocklist(recent, 300000)).toBe(false);
    });
  });
});
