# Copcivil Part 2: Payload Patterns + Loader

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create categorized JSON payload files for 4 attack types (SQLi, XSS, CMDi, Path Traversal) and a loader that validates and merges them for the detection engine.

**Architecture:** JSON files in `/copcivil/payloads/` with a `loader.js` that reads, validates, and exports a flat pattern array compatible with `createDetector()` from Part 1.

**Tech Stack:** Vitest, pure JS (ES modules), JSON.

**Spec Reference:** `docs/superpowers/specs/2026-04-29-copcivil-security-system-design.md` — Section 4

**Depends On:** Part 1 (detection engine must be completed first)

---

## File Structure

```
copcivil/
├── payloads/
│   ├── sqli.json              # SQL Injection patterns
│   ├── xss.json               # Cross-Site Scripting patterns
│   ├── cmdi.json              # Command Injection patterns
│   ├── path-traversal.json    # Path Traversal / LFI patterns
│   └── loader.js              # Validates + merges all JSON files
└── __tests__/
    └── payloads.test.js       # Tests for loader + pattern validation
```

---

### Task 1: SQL Injection Patterns

**Files:**
- Create: `copcivil/payloads/sqli.json`

- [ ] **Step 1: Create sqli.json**

Create `copcivil/payloads/sqli.json`:
```json
{
  "category": "sqli",
  "description": "SQL Injection detection patterns",
  "version": "1.0.0",
  "patterns": [
    { "id": "SQLI-001", "pattern": "union select", "severity": "high", "description": "UNION-based injection" },
    { "id": "SQLI-002", "pattern": "union all select", "severity": "high", "description": "UNION ALL injection" },
    { "id": "SQLI-003", "pattern": "or 1=1", "severity": "medium", "description": "Boolean tautology (1=1)" },
    { "id": "SQLI-004", "pattern": "or '1'='1", "severity": "medium", "description": "Boolean tautology (string)" },
    { "id": "SQLI-005", "pattern": "or \"1\"=\"1", "severity": "medium", "description": "Boolean tautology (double quote)" },
    { "id": "SQLI-006", "pattern": "or true", "severity": "medium", "description": "Boolean tautology (true)" },
    { "id": "SQLI-007", "pattern": "drop table", "severity": "critical", "description": "DROP TABLE statement" },
    { "id": "SQLI-008", "pattern": "drop database", "severity": "critical", "description": "DROP DATABASE statement" },
    { "id": "SQLI-009", "pattern": "delete from", "severity": "high", "description": "DELETE FROM statement" },
    { "id": "SQLI-010", "pattern": "insert into", "severity": "high", "description": "INSERT INTO statement" },
    { "id": "SQLI-011", "pattern": "update set", "severity": "high", "description": "UPDATE SET statement" },
    { "id": "SQLI-012", "pattern": "select from", "severity": "medium", "description": "SELECT FROM statement" },
    { "id": "SQLI-013", "pattern": "' or '", "severity": "medium", "description": "Quote-based OR injection" },
    { "id": "SQLI-014", "pattern": "1' or '1'='1", "severity": "high", "description": "Classic string injection" },
    { "id": "SQLI-015", "pattern": "'; --", "severity": "high", "description": "Quote with comment terminator" },
    { "id": "SQLI-016", "pattern": "' --", "severity": "medium", "description": "Quote with line comment" },
    { "id": "SQLI-017", "pattern": "exec xp_", "severity": "critical", "description": "MSSQL extended stored procedure" },
    { "id": "SQLI-018", "pattern": "exec sp_", "severity": "critical", "description": "MSSQL stored procedure" },
    { "id": "SQLI-019", "pattern": "waitfor delay", "severity": "high", "description": "Time-based blind SQLi (MSSQL)" },
    { "id": "SQLI-020", "pattern": "benchmark(", "severity": "high", "description": "Time-based blind SQLi (MySQL)" },
    { "id": "SQLI-021", "pattern": "sleep(", "severity": "high", "description": "Time-based blind SQLi (MySQL sleep)" },
    { "id": "SQLI-022", "pattern": "having 1=1", "severity": "medium", "description": "HAVING clause injection" },
    { "id": "SQLI-023", "pattern": "group by", "severity": "low", "description": "GROUP BY (context-dependent)" },
    { "id": "SQLI-024", "pattern": "order by", "severity": "low", "description": "ORDER BY (context-dependent)" },
    { "id": "SQLI-025", "pattern": "information_schema", "severity": "high", "description": "Schema enumeration" },
    { "id": "SQLI-026", "pattern": "load_file(", "severity": "critical", "description": "File read via SQL" },
    { "id": "SQLI-027", "pattern": "into outfile", "severity": "critical", "description": "File write via SQL" },
    { "id": "SQLI-028", "pattern": "into dumpfile", "severity": "critical", "description": "Binary file write via SQL" },
    { "id": "SQLI-029", "pattern": "char(", "severity": "low", "description": "CHAR function (evasion technique)" },
    { "id": "SQLI-030", "pattern": "concat(", "severity": "low", "description": "CONCAT function (evasion technique)" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add copcivil/payloads/sqli.json
git commit -m "feat(copcivil): add SQL injection payload patterns (30 patterns)"
```

---

### Task 2: XSS Patterns

**Files:**
- Create: `copcivil/payloads/xss.json`

- [ ] **Step 1: Create xss.json**

Create `copcivil/payloads/xss.json`:
```json
{
  "category": "xss",
  "description": "Cross-Site Scripting detection patterns",
  "version": "1.0.0",
  "patterns": [
    { "id": "XSS-001", "pattern": "<script>", "severity": "high", "description": "Script tag open" },
    { "id": "XSS-002", "pattern": "</script>", "severity": "high", "description": "Script tag close" },
    { "id": "XSS-003", "pattern": "<script src=", "severity": "high", "description": "External script inclusion" },
    { "id": "XSS-004", "pattern": "javascript:", "severity": "high", "description": "JavaScript protocol handler" },
    { "id": "XSS-005", "pattern": "onerror=", "severity": "medium", "description": "onerror event handler" },
    { "id": "XSS-006", "pattern": "onload=", "severity": "medium", "description": "onload event handler" },
    { "id": "XSS-007", "pattern": "onmouseover=", "severity": "medium", "description": "onmouseover event handler" },
    { "id": "XSS-008", "pattern": "onfocus=", "severity": "medium", "description": "onfocus event handler" },
    { "id": "XSS-009", "pattern": "onclick=", "severity": "medium", "description": "onclick event handler" },
    { "id": "XSS-010", "pattern": "onsubmit=", "severity": "medium", "description": "onsubmit event handler" },
    { "id": "XSS-011", "pattern": "<svg onload=", "severity": "high", "description": "SVG with onload" },
    { "id": "XSS-012", "pattern": "<img src=x onerror=", "severity": "high", "description": "IMG tag with onerror" },
    { "id": "XSS-013", "pattern": "<iframe", "severity": "high", "description": "iframe injection" },
    { "id": "XSS-014", "pattern": "<object", "severity": "high", "description": "object tag injection" },
    { "id": "XSS-015", "pattern": "<embed", "severity": "high", "description": "embed tag injection" },
    { "id": "XSS-016", "pattern": "<body onload=", "severity": "high", "description": "Body tag with onload" },
    { "id": "XSS-017", "pattern": "document.cookie", "severity": "critical", "description": "Cookie theft attempt" },
    { "id": "XSS-018", "pattern": "document.location", "severity": "high", "description": "Location manipulation" },
    { "id": "XSS-019", "pattern": "window.location", "severity": "high", "description": "Window location redirect" },
    { "id": "XSS-020", "pattern": "document.write(", "severity": "high", "description": "DOM write injection" },
    { "id": "XSS-021", "pattern": ".innerhtml", "severity": "medium", "description": "innerHTML manipulation" },
    { "id": "XSS-022", "pattern": "eval(", "severity": "critical", "description": "Eval execution" },
    { "id": "XSS-023", "pattern": "alert(", "severity": "medium", "description": "Alert call (XSS probe)" },
    { "id": "XSS-024", "pattern": "prompt(", "severity": "medium", "description": "Prompt call (XSS probe)" },
    { "id": "XSS-025", "pattern": "confirm(", "severity": "medium", "description": "Confirm call (XSS probe)" },
    { "id": "XSS-026", "pattern": "fromcharcode", "severity": "medium", "description": "String.fromCharCode evasion" },
    { "id": "XSS-027", "pattern": "expression(", "severity": "high", "description": "CSS expression (IE)" },
    { "id": "XSS-028", "pattern": "vbscript:", "severity": "high", "description": "VBScript protocol handler" },
    { "id": "XSS-029", "pattern": "data:text/html", "severity": "high", "description": "Data URI HTML payload" },
    { "id": "XSS-030", "pattern": "<marquee", "severity": "low", "description": "Marquee tag (legacy XSS vector)" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add copcivil/payloads/xss.json
git commit -m "feat(copcivil): add XSS payload patterns (30 patterns)"
```

---

### Task 3: Command Injection Patterns

**Files:**
- Create: `copcivil/payloads/cmdi.json`

- [ ] **Step 1: Create cmdi.json**

Create `copcivil/payloads/cmdi.json`:
```json
{
  "category": "cmdi",
  "description": "Command Injection detection patterns",
  "version": "1.0.0",
  "patterns": [
    { "id": "CMDI-001", "pattern": "; ls", "severity": "high", "description": "Semicolon + ls command" },
    { "id": "CMDI-002", "pattern": "| ls", "severity": "high", "description": "Pipe + ls command" },
    { "id": "CMDI-003", "pattern": "& ls", "severity": "high", "description": "Background + ls command" },
    { "id": "CMDI-004", "pattern": "; cat ", "severity": "high", "description": "Semicolon + cat command" },
    { "id": "CMDI-005", "pattern": "| cat ", "severity": "high", "description": "Pipe + cat command" },
    { "id": "CMDI-006", "pattern": "; id", "severity": "high", "description": "Semicolon + id command" },
    { "id": "CMDI-007", "pattern": "| id", "severity": "high", "description": "Pipe + id command" },
    { "id": "CMDI-008", "pattern": "; whoami", "severity": "high", "description": "Semicolon + whoami" },
    { "id": "CMDI-009", "pattern": "| whoami", "severity": "high", "description": "Pipe + whoami" },
    { "id": "CMDI-010", "pattern": "; uname", "severity": "high", "description": "Semicolon + uname" },
    { "id": "CMDI-011", "pattern": "; pwd", "severity": "medium", "description": "Semicolon + pwd" },
    { "id": "CMDI-012", "pattern": "| pwd", "severity": "medium", "description": "Pipe + pwd" },
    { "id": "CMDI-013", "pattern": "; rm ", "severity": "critical", "description": "Semicolon + rm (file deletion)" },
    { "id": "CMDI-014", "pattern": "| rm ", "severity": "critical", "description": "Pipe + rm (file deletion)" },
    { "id": "CMDI-015", "pattern": "; wget ", "severity": "critical", "description": "Remote file download" },
    { "id": "CMDI-016", "pattern": "; curl ", "severity": "critical", "description": "Remote request via curl" },
    { "id": "CMDI-017", "pattern": "| wget ", "severity": "critical", "description": "Pipe + wget" },
    { "id": "CMDI-018", "pattern": "| curl ", "severity": "critical", "description": "Pipe + curl" },
    { "id": "CMDI-019", "pattern": "$( ", "severity": "medium", "description": "Command substitution $(" },
    { "id": "CMDI-020", "pattern": "` ", "severity": "medium", "description": "Backtick command substitution" },
    { "id": "CMDI-021", "pattern": "/etc/passwd", "severity": "high", "description": "Passwd file access" },
    { "id": "CMDI-022", "pattern": "/etc/shadow", "severity": "critical", "description": "Shadow file access" },
    { "id": "CMDI-023", "pattern": "; nc ", "severity": "critical", "description": "Netcat reverse shell" },
    { "id": "CMDI-024", "pattern": "| nc ", "severity": "critical", "description": "Pipe + netcat" },
    { "id": "CMDI-025", "pattern": "; python ", "severity": "high", "description": "Python execution" },
    { "id": "CMDI-026", "pattern": "; perl ", "severity": "high", "description": "Perl execution" },
    { "id": "CMDI-027", "pattern": "; bash ", "severity": "high", "description": "Bash execution" },
    { "id": "CMDI-028", "pattern": "; sh ", "severity": "high", "description": "Shell execution" },
    { "id": "CMDI-029", "pattern": "/bin/sh", "severity": "high", "description": "Direct shell path" },
    { "id": "CMDI-030", "pattern": "/bin/bash", "severity": "high", "description": "Direct bash path" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add copcivil/payloads/cmdi.json
git commit -m "feat(copcivil): add command injection payload patterns (30 patterns)"
```

---

### Task 4: Path Traversal Patterns

**Files:**
- Create: `copcivil/payloads/path-traversal.json`

- [ ] **Step 1: Create path-traversal.json**

Create `copcivil/payloads/path-traversal.json`:
```json
{
  "category": "path_traversal",
  "description": "Path Traversal / Local File Inclusion detection patterns",
  "version": "1.0.0",
  "patterns": [
    { "id": "PT-001", "pattern": "../../../", "severity": "high", "description": "Triple directory traversal" },
    { "id": "PT-002", "pattern": "..\\..\\..\\", "severity": "high", "description": "Windows triple traversal" },
    { "id": "PT-003", "pattern": "....//....//", "severity": "high", "description": "Double-dot-slash evasion" },
    { "id": "PT-004", "pattern": "..%2f..%2f", "severity": "high", "description": "URL-encoded traversal (after decode)" },
    { "id": "PT-005", "pattern": "..%5c..%5c", "severity": "high", "description": "URL-encoded backslash traversal" },
    { "id": "PT-006", "pattern": "/etc/passwd", "severity": "high", "description": "Linux password file" },
    { "id": "PT-007", "pattern": "/etc/shadow", "severity": "critical", "description": "Linux shadow file" },
    { "id": "PT-008", "pattern": "/etc/hosts", "severity": "medium", "description": "Hosts file access" },
    { "id": "PT-009", "pattern": "/proc/self/", "severity": "high", "description": "Proc self access" },
    { "id": "PT-010", "pattern": "c:\\windows\\", "severity": "high", "description": "Windows system directory" },
    { "id": "PT-011", "pattern": "c:\\boot.ini", "severity": "high", "description": "Windows boot config" },
    { "id": "PT-012", "pattern": "win.ini", "severity": "medium", "description": "Windows INI file" },
    { "id": "PT-013", "pattern": "web.config", "severity": "medium", "description": "ASP.NET config file" },
    { "id": "PT-014", "pattern": ".htaccess", "severity": "medium", "description": "Apache config file" },
    { "id": "PT-015", "pattern": ".env", "severity": "high", "description": "Environment file access" },
    { "id": "PT-016", "pattern": "wp-config.php", "severity": "high", "description": "WordPress config" },
    { "id": "PT-017", "pattern": "/var/log/", "severity": "medium", "description": "Log file access" },
    { "id": "PT-018", "pattern": "php://filter", "severity": "critical", "description": "PHP stream filter (LFI)" },
    { "id": "PT-019", "pattern": "php://input", "severity": "critical", "description": "PHP input stream (RCE)" },
    { "id": "PT-020", "pattern": "expect://", "severity": "critical", "description": "PHP expect wrapper (RCE)" },
    { "id": "PT-021", "pattern": "file:///", "severity": "high", "description": "File protocol access" },
    { "id": "PT-022", "pattern": ".git/config", "severity": "high", "description": "Git config exposure" },
    { "id": "PT-023", "pattern": ".svn/entries", "severity": "high", "description": "SVN metadata exposure" },
    { "id": "PT-024", "pattern": "id_rsa", "severity": "critical", "description": "SSH private key access" },
    { "id": "PT-025", "pattern": "authorized_keys", "severity": "high", "description": "SSH authorized keys" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add copcivil/payloads/path-traversal.json
git commit -m "feat(copcivil): add path traversal payload patterns (25 patterns)"
```

---

### Task 5: Payload Loader + Tests

**Files:**
- Create: `copcivil/__tests__/payloads.test.js`
- Create: `copcivil/payloads/loader.js`

- [ ] **Step 1: Write the failing tests**

Create `copcivil/__tests__/payloads.test.js`:
```javascript
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run copcivil/__tests__/payloads.test.js
```

Expected: FAIL — cannot find module `../payloads/loader.js`

- [ ] **Step 3: Implement loader**

Create `copcivil/payloads/loader.js`:
```javascript
import { SEVERITY_ORDER } from '../shared/constants.js';

import sqliData from './sqli.json' with { type: 'json' };
import xssData from './xss.json' with { type: 'json' };
import cmdiData from './cmdi.json' with { type: 'json' };
import pathTraversalData from './path-traversal.json' with { type: 'json' };

const FILE_MAP = {
  'sqli': sqliData,
  'xss': xssData,
  'cmdi': cmdiData,
  'path-traversal': pathTraversalData,
};

/**
 * Validate a parsed pattern file object.
 * @param {object} file
 * @throws {Error} if validation fails
 */
export function validatePatternFile(file) {
  if (!file.category || typeof file.category !== 'string') {
    throw new Error('Invalid pattern file: missing or invalid "category"');
  }
  if (!Array.isArray(file.patterns)) {
    throw new Error('Invalid pattern file: missing or invalid "patterns" array');
  }

  for (let i = 0; i < file.patterns.length; i++) {
    const p = file.patterns[i];
    if (!p.id || typeof p.id !== 'string') {
      throw new Error(`Invalid pattern at index ${i}: missing or invalid "id"`);
    }
    if (!p.pattern || typeof p.pattern !== 'string') {
      throw new Error(`Invalid pattern at index ${i} (${p.id}): missing or invalid "pattern"`);
    }
    if (!p.severity || !SEVERITY_ORDER.includes(p.severity)) {
      throw new Error(
        `Invalid pattern at index ${i} (${p.id}): invalid "severity" "${p.severity}". Must be one of: ${SEVERITY_ORDER.join(', ')}`
      );
    }
  }
}

/**
 * Load and validate a single pattern file by category name.
 * Returns a flat array of pattern entries with category attached.
 * @param {'sqli' | 'xss' | 'cmdi' | 'path-traversal'} categoryName
 * @returns {import('../shared/types.js').PatternEntry[]}
 */
export function loadPatternFile(categoryName) {
  const data = FILE_MAP[categoryName];
  if (!data) {
    throw new Error(`Unknown pattern category: "${categoryName}"`);
  }

  validatePatternFile(data);

  return data.patterns.map((p) => ({
    id: p.id,
    pattern: p.pattern.toLowerCase(),
    severity: p.severity,
    category: data.category,
    description: p.description || '',
  }));
}

/**
 * Load all pattern files and return a merged flat array.
 * @returns {import('../shared/types.js').PatternEntry[]}
 */
export function loadAllPatterns() {
  const allPatterns = [];

  for (const categoryName of Object.keys(FILE_MAP)) {
    const patterns = loadPatternFile(categoryName);
    allPatterns.push(...patterns);
  }

  return allPatterns;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run copcivil/__tests__/payloads.test.js
```

Expected: ALL PASS (11 tests)

> **Note:** If JSON import assertions (`with { type: 'json' }`) cause issues with your Node/Vitest version, change to `assert { type: 'json' }` or use `import { readFileSync } from 'fs'` with `JSON.parse`. The `with` syntax is the current standard (ES2025).

- [ ] **Step 5: Run ALL tests to verify nothing is broken**

Run:
```bash
npx vitest run
```

Expected: ALL PASS — approximately 60+ tests across all 5 test files.

- [ ] **Step 6: Commit**

```bash
git add copcivil/payloads/loader.js copcivil/__tests__/payloads.test.js
git commit -m "feat(copcivil): add payload loader with validation + tests"
```

---

## Summary

After completing all 5 tasks, you will have:

| Component | File | Patterns / Tests |
|---|---|---|
| SQLi patterns | `copcivil/payloads/sqli.json` | 30 patterns |
| XSS patterns | `copcivil/payloads/xss.json` | 30 patterns |
| CMDi patterns | `copcivil/payloads/cmdi.json` | 30 patterns |
| Path Traversal | `copcivil/payloads/path-traversal.json` | 25 patterns |
| Loader | `copcivil/payloads/loader.js` | 11 tests |

**Total: 115 patterns across 4 categories, 11 new tests, 5 commits.**

Next: Part 3 (Appwrite Functions) uses the engine + patterns together.
