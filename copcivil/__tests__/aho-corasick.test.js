import { describe, it, expect } from 'vitest';
import { AhoCorasick } from '../engine/aho-corasick.js';

describe('AhoCorasick', () => {
  describe('constructor', () => {
    it('creates an instance', () => {
      const ac = new AhoCorasick();
      expect(ac).toBeDefined();
    });
  });

  describe('addPattern + build + search', () => {
    it('finds a single pattern in text', () => {
      const ac = new AhoCorasick();
      ac.addPattern('hello', { id: 'P1', category: 'test', severity: 'low' });
      ac.build();

      const matches = ac.search('say hello world');
      expect(matches).toHaveLength(1);
      expect(matches[0]).toMatchObject({
        id: 'P1',
        pattern: 'hello',
        category: 'test',
        severity: 'low',
        position: 4,
      });
    });

    it('finds multiple different patterns', () => {
      const ac = new AhoCorasick();
      ac.addPattern('he', { id: 'P1', category: 'a', severity: 'low' });
      ac.addPattern('she', { id: 'P2', category: 'b', severity: 'medium' });
      ac.addPattern('his', { id: 'P3', category: 'c', severity: 'high' });
      ac.addPattern('hers', { id: 'P4', category: 'd', severity: 'critical' });
      ac.build();

      const matches = ac.search('ahishers');
      const ids = matches.map(m => m.id).sort();
      expect(ids).toContain('P1');
      expect(ids).toContain('P2');
      expect(ids).toContain('P3');
      expect(ids).toContain('P4');
    });

    it('finds overlapping patterns', () => {
      const ac = new AhoCorasick();
      ac.addPattern('union select', { id: 'S1', category: 'sqli', severity: 'high' });
      ac.addPattern('select', { id: 'S2', category: 'sqli', severity: 'low' });
      ac.build();

      const matches = ac.search('union select from users');
      expect(matches.length).toBeGreaterThanOrEqual(2);
      const ids = matches.map(m => m.id);
      expect(ids).toContain('S1');
      expect(ids).toContain('S2');
    });

    it('returns empty array for no matches', () => {
      const ac = new AhoCorasick();
      ac.addPattern('attack', { id: 'A1', category: 'test', severity: 'low' });
      ac.build();

      const matches = ac.search('this is clean text');
      expect(matches).toHaveLength(0);
    });

    it('handles empty input text', () => {
      const ac = new AhoCorasick();
      ac.addPattern('test', { id: 'T1', category: 'test', severity: 'low' });
      ac.build();

      const matches = ac.search('');
      expect(matches).toHaveLength(0);
    });

    it('finds repeated occurrences of the same pattern', () => {
      const ac = new AhoCorasick();
      ac.addPattern('ab', { id: 'R1', category: 'test', severity: 'low' });
      ac.build();

      const matches = ac.search('ababab');
      expect(matches).toHaveLength(3);
      expect(matches[0].position).toBe(0);
      expect(matches[1].position).toBe(2);
      expect(matches[2].position).toBe(4);
    });

    it('throws if search called before build', () => {
      const ac = new AhoCorasick();
      ac.addPattern('test', { id: 'T1', category: 'test', severity: 'low' });

      expect(() => ac.search('test')).toThrow('Call build() before search()');
    });

    it('handles patterns that are substrings of each other', () => {
      const ac = new AhoCorasick();
      ac.addPattern('script', { id: 'X1', category: 'xss', severity: 'medium' });
      ac.addPattern('<script>', { id: 'X2', category: 'xss', severity: 'high' });
      ac.build();

      const matches = ac.search('<script>alert(1)</script>');
      const ids = matches.map(m => m.id);
      expect(ids).toContain('X1');
      expect(ids).toContain('X2');
    });
  });
});
