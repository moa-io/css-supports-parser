import { describe, it, expect } from 'vitest';
import { SupportsParser } from '../src/SupportsParser';

describe('SupportConditionParser', () => {
  it('should handle simple condition', () => {
    const parser = new SupportsParser('(color: #FFAA)');
    expect(parser.checkProperty('color: #FFAA')).toBe(true);
    expect(parser.checkProperty('color: #FFBB')).toBeUndefined();
    expect(parser.checkProperty('display: flex')).toBeUndefined();
  });

  it('should handle AND conditions', () => {
    const parser = new SupportsParser('(color: #FFAA) and (display: flex)');
    expect(parser.checkProperty('color: #FFAA')).toBe(true);
    expect(parser.checkProperty('display: flex')).toBe(true);
    expect(parser.checkProperty('display: grid')).toBeUndefined();
  });

  it('should handle OR conditions', () => {
    const parser = new SupportsParser('(display: flex) or (display: grid)');
    // When checking for display: flex, it should return true even though there's OR
    // because the question is "would this property-value pass the condition?"
    expect(parser.checkProperty('display: flex')).toBeUndefined();
    expect(parser.checkProperty('display: grid')).toBeUndefined();
    expect(parser.checkProperty('display: block')).toBeUndefined();
  });

  it('should handle complex conditions with OR at same level', () => {
    const parser = new SupportsParser('(color: #FFAA) and ((display: flex) or (display: grid)) and (font-tech(color-COLRv1))');
    expect(parser.checkProperty('color: #FFAA')).toBe(true);
    expect(parser.checkProperty('display: flex')).toBeUndefined(); // Because of OR at same level
    expect(parser.checkProperty('display: grid')).toBeUndefined(); // Because of OR at same level
  });

  it('should handle nested NOT conditions (even number)', () => {
    const parser = new SupportsParser('(color: #FFAA) and (not (not ( not ( not ( display: flex) ))))');
    expect(parser.checkProperty('display: flex')).toBe(true);
  });

  it('should handle nested NOT conditions (odd number)', () => {
    const parser = new SupportsParser('(color: #FFAA) and (not (not ( not ( display: flex) )))');
    expect(parser.checkProperty('display: flex')).toBe(false);
  });

  it('should throw error for invalid syntax', () => {
		expect(() => new SupportsParser('\n\t', false)).toThrow();
		expect(new SupportsParser('\n\t', true).checkProperty('')).toBeUndefined();

		expect(() => new SupportsParser('@supports', false).checkProperty('')).toThrow();
		expect(() => new SupportsParser('color: #FFAA', false).checkProperty('')).toThrow();
  });
});