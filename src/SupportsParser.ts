import { parse } from './utils';
import type { SupportsAST } from './types';

/**
 * A parser for CSS @supports conditions that evaluates whether specific features
 * would pass the condition, handling complex logical expressions including:
 * - Feature queries (e.g., `(display: grid)`)
 * - Logical operators (`and`, `or`, `not`)
 * - Nested expressions
 */
export class SupportsParser {
  private readonly root: SupportsAST;
  private readonly silent: boolean;

  /**
   * Creates a new SupportsParser instance
   * @param condition The CSS @supports condition to parse
   * @param silent Whether to suppress parsing errors (default: false)
   * @throws {Error} When the condition is invalid and silent is false
   */
  constructor(condition: string, silent: boolean = false) {
    this.silent =  silent
    this.root = this.parseCondition(condition);
  }

  /**
   * Parses and validates the condition string
   * @private
   */
  private parseCondition(condition: string): SupportsAST {
    try {
      if (!condition.trim()) {
        throw new Error('Empty condition provided');
      }

      // Remove @supports prefix if present and trim whitespace
      const cleanCondition = condition
        .replace(/^@supports\s*/, '')
        .trim();

      if (!cleanCondition) {
        throw new Error('Invalid condition syntax');
      }

      return parse(cleanCondition);
    } catch (error) {
      if (!this.silent) {
        throw error;
      }

      // Return a minimal valid AST when silent
      return { type: 'declaration', node: '' };
    }
  }

  /**
   * Checks if a given CSS feature would pass the support condition
   * @param feature The feature to check in format "property:value" or function name
   * @returns Boolean indicating if the feature passes the condition,
   *          or undefined if the feature isn't mentioned in the condition
   * @throws {Error} When the feature string is invalid
   */
  public checkProperty(feature: string) {
    try {
      const result = this.evaluateNode(this.root, this.normalizeFeature(feature));
      if (result.includes(false)) {
        return false
      } else if (result.includes(true)) {
        return true
      }
    } catch (error) {
      if (!this.silent) {
        throw error
      }
    }

    return undefined
  }

  /**
   * Normalizes and validates the feature string
   * @private
   */
  private normalizeFeature(feature: string): string {
    feature = (feature || '').replace(/\s/g, '').toLowerCase();

    if (!feature) {
      throw new Error('Empty feature provided');
    }

    // Normalize by removing whitespace and converting to lowercase
    return feature;
  }

  /**
   * Recursively evaluates the AST against the target feature
   * @private
   */
  private evaluateNode(node: SupportsAST, feature: string): boolean[] {
    switch (node.type) {
      case 'and':
        let result = new Set<boolean>();
        for (const child of node.node) {
          this.evaluateNode(child, feature).map(x => result.add(x))
        }
        return [...result];

      case 'not':
        return this.evaluateNode(node.node, feature).map(x => !x)

      case 'function':
      case 'declaration':
        if (node.node === feature) {
          return [true]
        }
    }

    return []
  }
}
