import { describe, it, expect } from 'vitest';
import { aggregateIncidents, buildAnalyticsPrompt, validateReportRequest } from '../ai-report-logic.js';

describe('AI Report Logic', () => {
  describe('validateReportRequest', () => {
    it('accepts valid on-demand request', () => {
      const result = validateReportRequest({
        period_start: '2026-04-01T00:00:00.000Z',
        period_end: '2026-04-29T23:59:59.000Z',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects missing period_start', () => {
      const result = validateReportRequest({ period_end: '2026-04-29T23:59:59.000Z' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('period_start');
    });

    it('rejects missing period_end', () => {
      const result = validateReportRequest({ period_start: '2026-04-01T00:00:00.000Z' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('period_end');
    });
  });

  describe('aggregateIncidents', () => {
    const sampleIncidents = [
      { attack_category: 'sqli', severity: 'high', ip_address: '1.1.1.1', request_url: '/api/users', action_taken: 'blocked', threat_score: 17 },
      { attack_category: 'sqli', severity: 'critical', ip_address: '1.1.1.1', request_url: '/api/users', action_taken: 'blocked', threat_score: 20 },
      { attack_category: 'xss', severity: 'medium', ip_address: '2.2.2.2', request_url: '/search', action_taken: 'warned', threat_score: 8 },
      { attack_category: 'xss', severity: 'high', ip_address: '3.3.3.3', request_url: '/search', action_taken: 'blocked', threat_score: 15 },
      { attack_category: 'cmdi', severity: 'critical', ip_address: '1.1.1.1', request_url: '/api/exec', action_taken: 'blocked', threat_score: 25 },
    ];

    it('counts total incidents', () => {
      const stats = aggregateIncidents(sampleIncidents);
      expect(stats.totalIncidents).toBe(5);
    });

    it('counts by category', () => {
      const stats = aggregateIncidents(sampleIncidents);
      expect(stats.byCategory).toEqual({ sqli: 2, xss: 2, cmdi: 1 });
    });

    it('counts by severity', () => {
      const stats = aggregateIncidents(sampleIncidents);
      expect(stats.bySeverity).toEqual({ critical: 2, high: 2, medium: 1 });
    });

    it('counts by action', () => {
      const stats = aggregateIncidents(sampleIncidents);
      expect(stats.byAction).toEqual({ blocked: 4, warned: 1 });
    });

    it('identifies top IPs', () => {
      const stats = aggregateIncidents(sampleIncidents);
      expect(stats.topIps[0]).toEqual({ ip: '1.1.1.1', count: 3 });
    });

    it('identifies top targeted URLs', () => {
      const stats = aggregateIncidents(sampleIncidents);
      expect(stats.topUrls[0].count).toBe(2);
    });

    it('calculates average threat score', () => {
      const stats = aggregateIncidents(sampleIncidents);
      expect(stats.avgThreatScore).toBe(17);
    });

    it('handles empty incidents array', () => {
      const stats = aggregateIncidents([]);
      expect(stats.totalIncidents).toBe(0);
      expect(stats.avgThreatScore).toBe(0);
    });
  });

  describe('buildAnalyticsPrompt', () => {
    it('builds a structured prompt string', () => {
      const stats = {
        totalIncidents: 5,
        byCategory: { sqli: 3, xss: 2 },
        bySeverity: { high: 3, medium: 2 },
        byAction: { blocked: 4, warned: 1 },
        topIps: [{ ip: '1.1.1.1', count: 3 }],
        topUrls: [{ url: '/api/users', count: 3 }],
        avgThreatScore: 15,
      };
      const period = { start: '2026-04-01', end: '2026-04-29' };

      const prompt = buildAnalyticsPrompt(stats, period);
      expect(prompt).toContain('5');
      expect(prompt).toContain('sqli');
      expect(prompt).toContain('1.1.1.1');
      expect(prompt).toContain('2026-04-01');
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
    });
  });
});
