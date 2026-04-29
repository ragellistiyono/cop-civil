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
