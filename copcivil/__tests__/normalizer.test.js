import { describe, it, expect } from 'vitest';
import {
  urlDecode,
  doubleDecode,
  htmlEntityDecode,
  caseFold,
  stripSqlComments,
  collapseWhitespace,
  stripNullBytes,
  normalize,
} from '../engine/normalizer.js';

describe('Normalizer', () => {
  describe('urlDecode', () => {
    it('decodes percent-encoded characters', () => {
      expect(urlDecode('%3Cscript%3E')).toBe('<script>');
    });

    it('decodes single quote', () => {
      expect(urlDecode('%27')).toBe("'");
    });

    it('returns input unchanged if no encoding', () => {
      expect(urlDecode('hello')).toBe('hello');
    });

    it('handles malformed encoding gracefully', () => {
      expect(urlDecode('%ZZ')).toBe('%ZZ');
    });
  });

  describe('doubleDecode', () => {
    it('decodes double-encoded input', () => {
      expect(doubleDecode('%253Cscript%253E')).toBe('<script>');
    });

    it('decodes single-encoded input too', () => {
      expect(doubleDecode('%3Cscript%3E')).toBe('<script>');
    });
  });

  describe('htmlEntityDecode', () => {
    it('decodes named entities', () => {
      expect(htmlEntityDecode('&lt;script&gt;')).toBe('<script>');
    });

    it('decodes decimal numeric entities', () => {
      expect(htmlEntityDecode('&#60;script&#62;')).toBe('<script>');
    });

    it('decodes hex numeric entities', () => {
      expect(htmlEntityDecode('&#x3C;script&#x3E;')).toBe('<script>');
    });

    it('decodes &amp; entity', () => {
      expect(htmlEntityDecode('a&amp;b')).toBe('a&b');
    });

    it('decodes &quot; and &#39; entities', () => {
      expect(htmlEntityDecode('&quot;hello&#39;')).toBe('"hello\'');
    });

    it('leaves unrecognized entities untouched', () => {
      expect(htmlEntityDecode('&unknown;')).toBe('&unknown;');
    });
  });

  describe('caseFold', () => {
    it('lowercases all characters', () => {
      expect(caseFold('SeLeCt')).toBe('select');
    });

    it('handles mixed case with special chars', () => {
      expect(caseFold('UNION--SELECT')).toBe('union--select');
    });
  });

  describe('stripSqlComments', () => {
    it('removes inline block comments', () => {
      expect(stripSqlComments('SEL/**/ECT')).toBe('SELECT');
    });

    it('removes multi-char block comments', () => {
      expect(stripSqlComments('UN/*comment*/ION')).toBe('UNION');
    });

    it('removes -- line comments', () => {
      expect(stripSqlComments('SELECT--comment\nFROM')).toBe('SELECT\nFROM');
    });

    it('removes # line comments', () => {
      expect(stripSqlComments('DROP TABLE#comment\nusers')).toBe('DROP TABLE\nusers');
    });
  });

  describe('collapseWhitespace', () => {
    it('collapses multiple spaces', () => {
      expect(collapseWhitespace('UNION   SELECT')).toBe('UNION SELECT');
    });

    it('collapses tabs and newlines', () => {
      expect(collapseWhitespace("UNION\t\n  SELECT")).toBe('UNION SELECT');
    });

    it('trims leading and trailing whitespace', () => {
      expect(collapseWhitespace('  hello  ')).toBe('hello');
    });
  });

  describe('stripNullBytes', () => {
    it('removes null bytes', () => {
      expect(stripNullBytes('sel\x00ect')).toBe('select');
    });

    it('handles multiple null bytes', () => {
      expect(stripNullBytes('\x00a\x00b\x00')).toBe('ab');
    });
  });

  describe('normalize (full pipeline)', () => {
    it('normalizes a URL-encoded XSS payload', () => {
      const input = '%3Cscript%3Ealert(1)%3C%2Fscript%3E';
      expect(normalize(input)).toBe('<script>alert(1)</script>');
    });

    it('normalizes a double-encoded SQLi payload', () => {
      const input = '%2527%2520OR%25201%253D1';
      expect(normalize(input)).toBe("' or 1=1");
    });

    it('normalizes HTML entity encoded XSS', () => {
      const input = '&#60;img src=x onerror=alert(1)&#62;';
      expect(normalize(input)).toBe('<img src=x onerror=alert(1)>');
    });

    it('normalizes SQL with comments and case evasion', () => {
      const input = 'UNI/**/ON SEL/**/ECT';
      expect(normalize(input)).toBe('union select');
    });

    it('normalizes null-byte injection', () => {
      const input = 'sel\x00ect * from users';
      expect(normalize(input)).toBe('select * from users');
    });

    it('handles empty input', () => {
      expect(normalize('')).toBe('');
    });

    it('handles clean input without modification beyond case fold', () => {
      expect(normalize('Hello World')).toBe('hello world');
    });
  });
});
