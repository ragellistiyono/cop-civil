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
