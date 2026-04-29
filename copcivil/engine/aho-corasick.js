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
