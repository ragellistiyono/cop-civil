import { describe, it, expect } from 'vitest';
import { evaluate } from '../engine/scorer.js';
import { ACTIONS } from '../shared/constants.js';

describe('Scorer', () => {
  describe('evaluate', () => {
    it('returns "logged" for no matches', () => {
      const result = evaluate([]);
      expect(result.action).toBe(ACTIONS.LOGGED);
      expect(result.score).toBe(0);
      expect(result.matchCount).toBe(0);
      expect(result.severity).toBeNull();
      expect(result.primaryCategory).toBeNull();
    });

    it('returns "logged" for low-score matches (score < 7)', () => {
      const matches = [
        { id: 'S1', pattern: 'select', category: 'sqli', severity: 'low' },
        { id: 'S2', pattern: '../', category: 'path_traversal', severity: 'low' },
      ];
      const result = evaluate(matches);
      expect(result.action).toBe(ACTIONS.LOGGED);
      expect(result.score).toBe(2);
    });

    it('returns "warned" for medium-score matches (7 <= score < 15)', () => {
      const matches = [
        { id: 'S1', pattern: 'union select', category: 'sqli', severity: 'high' },
      ];
      const result = evaluate(matches);
      expect(result.action).toBe(ACTIONS.WARNED);
      expect(result.score).toBe(7);
    });

    it('returns "blocked" for high-score matches (score >= 15)', () => {
      const matches = [
        { id: 'S1', pattern: 'union select', category: 'sqli', severity: 'high' },
        { id: 'S2', pattern: 'drop table', category: 'sqli', severity: 'critical' },
      ];
      const result = evaluate(matches);
      expect(result.action).toBe(ACTIONS.BLOCKED);
      expect(result.score).toBe(17);
    });

    it('calculates correct severity (highest match wins)', () => {
      const matches = [
        { id: 'S1', pattern: 'select', category: 'sqli', severity: 'low' },
        { id: 'S2', pattern: 'union select', category: 'sqli', severity: 'high' },
        { id: 'S3', pattern: 'or 1=1', category: 'sqli', severity: 'medium' },
      ];
      const result = evaluate(matches);
      expect(result.severity).toBe('high');
    });

    it('determines primary category by highest category score', () => {
      const matches = [
        { id: 'X1', pattern: '<script>', category: 'xss', severity: 'high' },
        { id: 'S1', pattern: 'select', category: 'sqli', severity: 'low' },
        { id: 'S2', pattern: '../', category: 'sqli', severity: 'low' },
      ];
      const result = evaluate(matches);
      expect(result.primaryCategory).toBe('xss');
    });

    it('tracks per-category scores', () => {
      const matches = [
        { id: 'X1', pattern: '<script>', category: 'xss', severity: 'high' },
        { id: 'S1', pattern: 'select', category: 'sqli', severity: 'low' },
      ];
      const result = evaluate(matches);
      expect(result.categoryScores).toEqual({ xss: 7, sqli: 1 });
    });

    it('respects custom thresholds', () => {
      const matches = [
        { id: 'S1', pattern: 'or 1=1', category: 'sqli', severity: 'medium' },
      ];
      const result = evaluate(matches, { blockThreshold: 4, warnThreshold: 2 });
      expect(result.action).toBe(ACTIONS.BLOCKED);
      expect(result.score).toBe(4);
    });

    it('uses default thresholds when config is empty', () => {
      const matches = [
        { id: 'S1', pattern: 'or 1=1', category: 'sqli', severity: 'medium' },
      ];
      const result = evaluate(matches);
      expect(result.action).toBe(ACTIONS.LOGGED);
      expect(result.score).toBe(4);
    });

    it('handles critical severity reaching block threshold alone', () => {
      const matches = [
        { id: 'D1', pattern: 'drop table', category: 'sqli', severity: 'critical' },
        { id: 'D2', pattern: '<script>document.cookie', category: 'xss', severity: 'critical' },
      ];
      const result = evaluate(matches);
      expect(result.action).toBe(ACTIONS.BLOCKED);
      expect(result.score).toBe(20);
      expect(result.severity).toBe('critical');
    });
  });
});
