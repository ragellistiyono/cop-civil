# Copcivil Part 1: Project Setup + Detection Engine Core

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core detection engine — Aho-Corasick automaton, input normalizer, threat scorer, and detection pipeline — with full test coverage.

**Architecture:** Pure JavaScript modules in `/copcivil/engine/` and `/copcivil/shared/`. No external dependencies — must work in both Node.js (Appwrite Functions) and Deno (Netlify Edge). TDD approach: write failing tests first, then implement.

**Tech Stack:** Vitest (test runner), pure JS (ES modules), JSDoc for types.

**Spec Reference:** `docs/superpowers/specs/2026-04-29-copcivil-security-system-design.md` — Sections 2.3, 3.1–3.4

---

## File Structure

```
copcivil/
├── shared/
│   ├── constants.js        # Severity weights, thresholds, action enums
│   └── types.js            # JSDoc type definitions
├── engine/
│   ├── aho-corasick.js     # AC automaton builder + matcher
│   ├── normalizer.js       # Input normalization pipeline (7 steps)
│   ├── scorer.js           # Threat scoring logic
│   ├── detector.js         # Main detection pipeline (orchestrates all)
│   └── index.js            # Public API re-exports
└── __tests__/
    ├── aho-corasick.test.js
    ├── normalizer.test.js
    ├── scorer.test.js
    └── detector.test.js
```

Also modifies:
- `package.json` — add vitest dev dependency + test script
- `vite.config.js` — add test config

---

### Task 1: Project Setup — Vitest + Shared Constants

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Create: `copcivil/shared/constants.js`
- Create: `copcivil/shared/types.js`

- [ ] **Step 1: Install vitest**

Run:
```bash
npm install --save-dev vitest
```

- [ ] **Step 2: Add test script to package.json**

Add to `"scripts"` in `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Add test config to vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['copcivil/__tests__/**/*.test.js'],
  },
})
```

- [ ] **Step 4: Create shared constants**

Create `copcivil/shared/constants.js`:
```javascript
export const SEVERITY_WEIGHTS = {
  critical: 10,
  high: 7,
  medium: 4,
  low: 1,
};

export const THRESHOLDS = {
  BLOCK: 15,
  WARN: 7,
};

export const ACTIONS = {
  BLOCKED: 'blocked',
  WARNED: 'warned',
  LOGGED: 'logged',
};

export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

export const CATEGORIES = {
  SQLI: 'sqli',
  XSS: 'xss',
  CMDI: 'cmdi',
  PATH_TRAVERSAL: 'path_traversal',
};
```

- [ ] **Step 5: Create JSDoc type definitions**

Create `copcivil/shared/types.js`:
```javascript
/**
 * @typedef {'critical' | 'high' | 'medium' | 'low'} Severity
 */

/**
 * @typedef {'sqli' | 'xss' | 'cmdi' | 'path_traversal'} AttackCategory
 */

/**
 * @typedef {'blocked' | 'warned' | 'logged'} Action
 */

/**
 * @typedef {Object} PatternEntry
 * @property {string} id - Unique pattern ID (e.g., "SQLI-001")
 * @property {string} pattern - The pattern string (lowercase)
 * @property {Severity} severity - Pattern severity level
 * @property {AttackCategory} category - Attack category
 * @property {string} [description] - Human-readable description
 */

/**
 * @typedef {Object} Match
 * @property {string} id - Pattern ID that matched
 * @property {string} pattern - The matched pattern string
 * @property {AttackCategory} category - Attack category
 * @property {Severity} severity - Pattern severity
 * @property {number} position - Start position in the input string
 */

/**
 * @typedef {Object} ScorerResult
 * @property {Action} action - Decided action
 * @property {number} score - Total threat score
 * @property {Severity | null} severity - Highest severity matched
 * @property {AttackCategory | null} primaryCategory - Dominant attack category
 * @property {Record<string, number>} categoryScores - Score per category
 * @property {number} matchCount - Total number of matches
 */

/**
 * @typedef {Object} DetectionResult
 * @property {Action} action
 * @property {number} score
 * @property {Severity | null} severity
 * @property {AttackCategory | null} primaryCategory
 * @property {Record<string, number>} categoryScores
 * @property {number} matchCount
 * @property {Match[]} matches
 * @property {string} normalizedInput
 */

export {};
```

- [ ] **Step 6: Verify setup compiles**

Run:
```bash
npx vitest run
```

Expected: "No test files found" or similar (no tests yet). Exit code 0 or 1 with no crash.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js copcivil/shared/
git commit -m "chore: add vitest setup + copcivil shared constants and types"
```

---

### Task 2: Aho-Corasick Automaton

**Files:**
- Create: `copcivil/__tests__/aho-corasick.test.js`
- Create: `copcivil/engine/aho-corasick.js`

- [ ] **Step 1: Write the failing tests**

Create `copcivil/__tests__/aho-corasick.test.js`:
```javascript
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run copcivil/__tests__/aho-corasick.test.js
```

Expected: FAIL — cannot find module `../engine/aho-corasick.js`

- [ ] **Step 3: Implement Aho-Corasick**

Create `copcivil/engine/aho-corasick.js`:
```javascript
class AhoCorasickNode {
  constructor() {
    /** @type {Map<string, AhoCorasickNode>} */
    this.children = new Map();
    /** @type {AhoCorasickNode | null} */
    this.fail = null;
    /** @type {Array<{id: string, pattern: string, category: string, severity: string}>} */
    this.output = [];
  }
}

class AhoCorasick {
  constructor() {
    this.root = new AhoCorasickNode();
    this.built = false;
  }

  /**
   * Add a pattern to the automaton.
   * @param {string} pattern
   * @param {{id: string, category: string, severity: string}} metadata
   */
  addPattern(pattern, metadata) {
    let node = this.root;
    for (const char of pattern) {
      if (!node.children.has(char)) {
        node.children.set(char, new AhoCorasickNode());
      }
      node = node.children.get(char);
    }
    node.output.push({ pattern, ...metadata });
  }

  /**
   * Build failure links via BFS. Must be called after all patterns are added.
   */
  build() {
    const queue = [];

    for (const [, child] of this.root.children) {
      child.fail = this.root;
      queue.push(child);
    }

    while (queue.length > 0) {
      const current = queue.shift();

      for (const [char, child] of current.children) {
        queue.push(child);

        let fail = current.fail;
        while (fail !== null && !fail.children.has(char)) {
          fail = fail.fail;
        }

        child.fail = fail !== null ? fail.children.get(char) : this.root;

        if (child.fail === child) {
          child.fail = this.root;
        }

        child.output = [...child.output, ...child.fail.output];
      }
    }

    this.built = true;
  }

  /**
   * Search text for all pattern matches.
   * @param {string} text
   * @returns {Array<{id: string, pattern: string, category: string, severity: string, position: number}>}
   */
  search(text) {
    if (!this.built) {
      throw new Error('Call build() before search()');
    }

    const matches = [];
    let node = this.root;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      while (node !== this.root && !node.children.has(char)) {
        node = node.fail;
      }

      node = node.children.get(char) || this.root;

      for (const output of node.output) {
        matches.push({
          position: i - output.pattern.length + 1,
          ...output,
        });
      }
    }

    return matches;
  }
}

export { AhoCorasick };
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run copcivil/__tests__/aho-corasick.test.js
```

Expected: ALL PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add copcivil/engine/aho-corasick.js copcivil/__tests__/aho-corasick.test.js
git commit -m "feat(copcivil): add Aho-Corasick automaton with tests"
```

---

### Task 3: Input Normalizer

**Files:**
- Create: `copcivil/__tests__/normalizer.test.js`
- Create: `copcivil/engine/normalizer.js`

- [ ] **Step 1: Write the failing tests**

Create `copcivil/__tests__/normalizer.test.js`:
```javascript
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run copcivil/__tests__/normalizer.test.js
```

Expected: FAIL — cannot find module `../engine/normalizer.js`

- [ ] **Step 3: Implement normalizer**

Create `copcivil/engine/normalizer.js`:
```javascript
/**
 * Decode percent-encoded characters (URL decoding).
 * @param {string} input
 * @returns {string}
 */
export function urlDecode(input) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

/**
 * Apply URL decoding twice to catch double-encoded payloads.
 * @param {string} input
 * @returns {string}
 */
export function doubleDecode(input) {
  const first = urlDecode(input);
  return urlDecode(first);
}

/**
 * Decode HTML named and numeric (decimal + hex) entities.
 * @param {string} input
 * @returns {string}
 */
export function htmlEntityDecode(input) {
  const named = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };

  let result = input.replace(/&(lt|gt|amp|quot|apos|#39);/gi, (match) => {
    return named[match.toLowerCase()] || match;
  });

  result = result.replace(/&#(\d+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 10));
  });

  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });

  return result;
}

/**
 * Lowercase all characters.
 * @param {string} input
 * @returns {string}
 */
export function caseFold(input) {
  return input.toLowerCase();
}

/**
 * Remove SQL-style comments: block, line (--), and hash (#).
 * @param {string} input
 * @returns {string}
 */
export function stripSqlComments(input) {
  let result = input.replace(/\/\*[\s\S]*?\*\//g, '');
  result = result.replace(/--[^\n]*/g, '');
  result = result.replace(/#[^\n]*/g, '');
  return result;
}

/**
 * Collapse all whitespace sequences to a single space and trim.
 * @param {string} input
 * @returns {string}
 */
export function collapseWhitespace(input) {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Remove null bytes (\x00).
 * @param {string} input
 * @returns {string}
 */
export function stripNullBytes(input) {
  return input.replace(/\x00/g, '');
}

/**
 * Full normalization pipeline: null bytes → double decode → HTML entity decode
 * → case fold → SQL comment strip → whitespace collapse.
 * @param {string} input
 * @returns {string}
 */
export function normalize(input) {
  let result = input;
  result = stripNullBytes(result);
  result = doubleDecode(result);
  result = htmlEntityDecode(result);
  result = caseFold(result);
  result = stripSqlComments(result);
  result = collapseWhitespace(result);
  return result;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run copcivil/__tests__/normalizer.test.js
```

Expected: ALL PASS (20 tests)

- [ ] **Step 5: Commit**

```bash
git add copcivil/engine/normalizer.js copcivil/__tests__/normalizer.test.js
git commit -m "feat(copcivil): add input normalizer with 7-step pipeline"
```

---

### Task 4: Threat Scorer

**Files:**
- Create: `copcivil/__tests__/scorer.test.js`
- Create: `copcivil/engine/scorer.js`

- [ ] **Step 1: Write the failing tests**

Create `copcivil/__tests__/scorer.test.js`:
```javascript
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run copcivil/__tests__/scorer.test.js
```

Expected: FAIL — cannot find module `../engine/scorer.js`

- [ ] **Step 3: Implement scorer**

Create `copcivil/engine/scorer.js`:
```javascript
import { SEVERITY_WEIGHTS, THRESHOLDS, ACTIONS, SEVERITY_ORDER } from '../shared/constants.js';

/**
 * Evaluate a set of pattern matches and decide on an action.
 * @param {Array<{id: string, pattern: string, category: string, severity: string}>} matches
 * @param {{blockThreshold?: number, warnThreshold?: number}} [config={}]
 * @returns {import('../shared/types.js').ScorerResult}
 */
export function evaluate(matches, config = {}) {
  const blockThreshold = config.blockThreshold ?? THRESHOLDS.BLOCK;
  const warnThreshold = config.warnThreshold ?? THRESHOLDS.WARN;

  let totalScore = 0;
  /** @type {Record<string, number>} */
  const categoryScores = {};

  for (const match of matches) {
    const weight = SEVERITY_WEIGHTS[match.severity] ?? 1;
    totalScore += weight;

    if (!categoryScores[match.category]) {
      categoryScores[match.category] = 0;
    }
    categoryScores[match.category] += weight;
  }

  let action;
  if (totalScore >= blockThreshold) {
    action = ACTIONS.BLOCKED;
  } else if (totalScore >= warnThreshold) {
    action = ACTIONS.WARNED;
  } else {
    action = ACTIONS.LOGGED;
  }

  let highestSeverity = null;
  if (matches.length > 0) {
    highestSeverity = 'low';
    for (const match of matches) {
      if (SEVERITY_ORDER.indexOf(match.severity) < SEVERITY_ORDER.indexOf(highestSeverity)) {
        highestSeverity = match.severity;
      }
    }
  }

  let primaryCategory = null;
  let maxCategoryScore = 0;
  for (const [cat, score] of Object.entries(categoryScores)) {
    if (score > maxCategoryScore) {
      maxCategoryScore = score;
      primaryCategory = cat;
    }
  }

  return {
    action,
    score: totalScore,
    severity: highestSeverity,
    primaryCategory,
    categoryScores,
    matchCount: matches.length,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run copcivil/__tests__/scorer.test.js
```

Expected: ALL PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add copcivil/engine/scorer.js copcivil/__tests__/scorer.test.js
git commit -m "feat(copcivil): add threat scorer with configurable thresholds"
```

---

### Task 5: Detection Pipeline + Public API

**Files:**
- Create: `copcivil/__tests__/detector.test.js`
- Create: `copcivil/engine/detector.js`
- Create: `copcivil/engine/index.js`

- [ ] **Step 1: Write the failing tests**

Create `copcivil/__tests__/detector.test.js`:
```javascript
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run copcivil/__tests__/detector.test.js
```

Expected: FAIL — cannot find module `../engine/detector.js`

- [ ] **Step 3: Implement detector**

Create `copcivil/engine/detector.js`:
```javascript
import { AhoCorasick } from './aho-corasick.js';
import { normalize } from './normalizer.js';
import { evaluate } from './scorer.js';

/**
 * Create a detector instance with pre-built AC automaton.
 * @param {import('../shared/types.js').PatternEntry[]} patterns
 * @param {{blockThreshold?: number, warnThreshold?: number}} [config={}]
 * @returns {{ detect: (input: string) => import('../shared/types.js').DetectionResult }}
 */
export function createDetector(patterns, config = {}) {
  const ac = new AhoCorasick();

  for (const p of patterns) {
    ac.addPattern(p.pattern.toLowerCase(), {
      id: p.id,
      category: p.category,
      severity: p.severity,
    });
  }

  ac.build();

  /**
   * Run the full detection pipeline on an input string.
   * @param {string} input
   * @returns {import('../shared/types.js').DetectionResult}
   */
  function detect(input) {
    const normalizedInput = normalize(input);
    const matches = ac.search(normalizedInput);
    const scored = evaluate(matches, config);

    return {
      ...scored,
      matches: matches.map((m) => ({
        id: m.id,
        pattern: m.pattern,
        category: m.category,
        severity: m.severity,
        position: m.position,
      })),
      normalizedInput,
    };
  }

  return { detect };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run copcivil/__tests__/detector.test.js
```

Expected: ALL PASS (12 tests)

- [ ] **Step 5: Create public API index**

Create `copcivil/engine/index.js`:
```javascript
export { AhoCorasick } from './aho-corasick.js';
export { normalize } from './normalizer.js';
export { evaluate } from './scorer.js';
export { createDetector } from './detector.js';
```

- [ ] **Step 6: Run all tests to verify everything works together**

Run:
```bash
npx vitest run
```

Expected: ALL PASS — approximately 50 tests total across all 4 test files.

- [ ] **Step 7: Commit**

```bash
git add copcivil/engine/detector.js copcivil/engine/index.js copcivil/__tests__/detector.test.js
git commit -m "feat(copcivil): add detection pipeline + public API index"
```

---

## Summary

After completing all 5 tasks, you will have:

| Component | File | Tests |
|---|---|---|
| Constants + types | `copcivil/shared/constants.js`, `types.js` | — |
| Aho-Corasick | `copcivil/engine/aho-corasick.js` | 8 tests |
| Normalizer | `copcivil/engine/normalizer.js` | 20 tests |
| Scorer | `copcivil/engine/scorer.js` | 10 tests |
| Detector | `copcivil/engine/detector.js` | 12 tests |
| Public API | `copcivil/engine/index.js` | — |

**Total: ~50 tests, 5 commits, fully testable detection engine.**

Next: Part 2 (Payload Patterns) builds on this foundation.
