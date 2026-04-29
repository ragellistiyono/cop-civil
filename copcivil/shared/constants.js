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
