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
