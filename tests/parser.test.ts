import { describe, expect, it } from "vitest";
import { SupportsParser } from "../src/SupportsParser";
import type { SupportsAST } from "../src/types";
import { parse } from "../src/utils";

/**
 * Test cases for @supports parser
 * Format: {
 *   name: 'Test description',
 *   input: 'supports condition string',
 *   expected: expectedOutput
 * }
 */
const testCases: TestCase[] = [
  // Basic tests
	{
		group: 'Basic tests',
		cases: [
			{
				name: 'Simple property check',
				input: '(display: grid)',
				expected: {
					type: 'declaration',
					node: 'display:grid'
				}
			},
			{
				name: 'NOT operator',
				input: '(not (color: rebeccapurple))',
				expected: {
					type: 'not',
					node: {
						type: 'declaration',
						node: 'color:rebeccapurple'
					}
				}
			},
			{
				name: 'AND combination',
				input: '(display: grid) and (color: rebeccapurple)',
				expected: {
					type: 'and',
					node: [
						{
							type: 'declaration',
							node: 'display:grid',
						},
						{
							type: 'declaration',
							node: 'color:rebeccapurple'
						}
					]
				}
			},
			{
				name: 'OR combination',
				input: '(display: flex) or (display: grid)',
				expected: {
					type: 'or',
					node: [
						{
							type: 'declaration',
							node: 'display:flex',
						},
						{
							type: 'declaration',
							node: 'display:grid'
						}
					]
				}
			},
		]
	},

  // Normal cases
	{
		group: 'Normal cases',
		cases: [
			{
				name: 'Nested combination',
				input: '(display: grid) and ((backdrop-filter: blur(5px)) or (not (color: rebeccapurple)))',
				expected: {
					type: 'and',
					node: [
						{
							type: 'declaration',
							node: 'display:grid'
						},
						{
							type: 'or',
							node: [
								{
									type: 'declaration',
									node: 'backdrop-filter:blur(5px)'
								},
								{
									type: 'not',
									node: {
										type: 'declaration',
										node: 'color:rebeccapurple'
									}
								}
							]
						}
					]
				}
			},
			{
				name: 'Function values',
				input: '(background: linear-gradient(0deg, rgba(0,0,0,0.5), rgba(255,255,255,1)))',
				expected: {
					type: 'declaration',
					node: 'background:linear-gradient(0deg,rgba(0,0,0,0.5),rgba(255,255,255,1))'
				}
			},
			{
				name: 'Multiple nested parentheses',
				input: '(not (not (display: grid)))',
				expected: {
					type: 'not',
					node: {
						type: 'not',
						node: {
							type: 'declaration',
							node: 'display:grid'
						}
					}
				}
			},
		]
	},

  // Edge cases
	{
		group: 'Edge cases',
		cases: [
			{
				name: 'Mixed operators without spaces',
				input: '((display:grid)and(color:rebeccapurple))or(transform:rotate(45deg))',
				expected: {
					type: 'or',
					node: [
						{
							type: 'and',
							node: [
								{
									type: 'declaration',
									node: 'display:grid'
								},
								{
									type: 'declaration',
									node: 'color:rebeccapurple'
								},
							]
						},
						{
							type: 'declaration',
							node: 'transform:rotate(45deg)'
						}
					]
				}
			},
			{
				name: 'Complex nested with function values',
				input: '(display: grid) and ((not (transform: translate3d(0,0,0))) or (animation: fade 2s ease-in))',
				expected: {
					type: 'and',
					node: [
						{
							type: 'declaration',
							node: 'display:grid'
						},
						{
							type: 'or',
							node: [
								{
									type: 'not',
									node: {
										type: 'declaration',
										node: 'transform:translate3d(0,0,0)'
									}
								},
								{
									type: 'declaration',
									node: 'animation:fade2sease-in'
								},
							]
						}
					]
				}
			},
			{
				name: 'Multiple operators with deep nesting',
				input: '((display: grid) or (display: flex)) and (not ((color: rgb(0,0,0)) or (background: url(\'test.png\'))))',
				expected: {
					type: 'and',
					node: [
						{
							type: 'or',
							node: [
								{
									type: 'declaration',
									node: 'display:grid'
								},
								{
									type: 'declaration',
									node: 'display:flex'
								},
							]
						},
						{
							type: 'not',

							node: {
								type: 'or',
								node: [
									{
										type: 'declaration',
										node: 'color:rgb(0,0,0)'
									},
									{
										type: 'declaration',
										node: 'background:url(\'test.png\')'
									},
								]
							},
						}
					]
				}
			},
		]
	},

  // Worst case scenarios
	{
		group: 'Worst case scenarios',
		cases: [
			{
				name: 'Minified complex query',
				input: '((display:grid)and(transform:rotate(30deg)))or(not(color:rgb(0,0,0)))',
				expected: {
					type: 'or',
					node: [
						{
							type: 'and',
							node: [
								{
									type: 'declaration',
									node: 'display:grid',
								},
								{
									type: 'declaration',
									node: 'transform:rotate(30deg)',
								}
							],
						},
						{
							type: 'not',
							node: {
								type: 'declaration',
								node: 'color:rgb(0,0,0)'
							}
						}
					]
				}
			},
			{
				name: 'Selector function syntax',
				input: '(selector(h2 > p)) and (display: flex)',
				expected: {
					type: 'and',
					node: [
						{
							type: 'function',
							node: 'selector(h2>p)',
						},
						{
							type: 'declaration',
							node: 'display:flex',
						}
					]
				}
			},
			{
				name: 'Font tech/format functions',
				input: '(font-tech(color-COLRv1)) or (font-format(woff2))',
				expected: {
					type: 'or',
					node: [
						{
							type: 'function',
							node: 'font-tech(color-colrv1)'
						},
						{
							type: 'function',
							node: 'font-format(woff2)'
						}
					]
				}
			},
			{
				name: 'Mixed quotes and escapes',
				input: '(font-family: "Some Font", \'Another Font\', sans-serif) and (content: "\\\\00A0")',
				expected: {
					type: 'and',
					node: [
						{
							type: 'declaration',
							node: 'font-family:"somefont",\'anotherfont\',sans-serif'
						},
						{
							type: 'declaration',
							node: 'content:"\\\\00a0"'
						}
					]
				}
			},
			{
				name: 'Multiple NOT operators',
				input: '(not (not (not (display: grid))))',
				expected: {
					type: 'not',
					node: {
						type: 'not',
						node: {
							type: 'not',
							node: {
								type: 'declaration',
								node: 'display:grid'
							}
						}
					}
				}
			},
			{
				name: 'Complex value functions',
				input: '(width: calc(100% - 30px)) and (height: max(100px, min(200px, 50vh)))',
				expected: {
					type: 'and',
					node: [
						{
							type: 'declaration',
							node: 'width:calc(100%-30px)'
						},
						{
							type: 'declaration',
							node: 'height:max(100px,min(200px,50vh))'
						}
					]
				}
			},
			{
				name: 'Multiple AND/OR combinations',
				input: '((a:1)and(b:2))or((c:3)and(d:4))or(e:5)',
				expected: {
					type: 'or',
					node: [
						{
							type: 'and',
							node: [
								{ type: 'declaration', node: 'a:1' },
								{ type: 'declaration', node: 'b:2' },
							]
						},
						{
							type: 'and',
							node: [
								{ type: 'declaration', node: 'c:3' },
								{ type: 'declaration', node: 'd:4' },
							]
						},
						{ type: 'declaration', node: 'e:5' },
					]
				}
			}
		]
	},

	// Wrong scenarios
	{
		group: 'Wrong scenarios (Handled)',
		cases: [
			{
				name: 'Using and + or in same level',
				input: '(display:grid)and(color:rebeccapurple)or(transform:rotate(45deg))',
				expected: {
					type: 'invalid',
					node: [
						{
							type: 'declaration',
							node: 'display:grid'
						},
						{
							type: 'declaration',
							node: 'color:rebeccapurple'
						},
						{
							type: 'declaration',
							node: 'transform:rotate(45deg)'
						}
					]
				}
			},
			{
				name: 'Complex nested with function values',
				input: '(display: grid) and (not (transform: translate3d(0,0,0))) or (animation: fade 2s ease-in)',
				expected: {
					type: 'invalid',
					node: [
						{
							type: 'declaration',
							node: 'display:grid'
						},
						{
							type: 'not',
							node: {
								type: 'declaration',
								node: 'transform:translate3d(0,0,0)'
							}
						},
						{
							type: 'declaration',
							node: 'animation:fade2sease-in'
						},
					]
				}
			},
			{
				name: 'Multiple AND/OR combinations',
				input: '(a:1)and(b:2)or(c:3)and(d:4)or(e:5)',
				expected: {
					type: 'invalid',
					node: [
						{ type: 'declaration', node: 'a:1' },
						{ type: 'declaration', node: 'b:2' },
						{ type: 'declaration', node: 'c:3' },
						{ type: 'declaration', node: 'd:4' },
						{ type: 'declaration', node: 'e:5' },
					]
				}
			},
			{
				name: 'Invalid condition, and Missing end quote',
				input: '(demo) and (selector(h2 > p)) and (content: "flex") or (content: "flex2)',
				expected: {
					type: 'invalid',
					node: [
						{
							type: 'invalid',
							node: 'demo',
						},
						{
							type: 'function',
							node: 'selector(h2>p)',
						},
						{
							type: 'declaration',
							node: 'content:"flex"',
						},
						{
							type: 'invalid',
							node: 'content:"flex2',
						}
					]
				}
			},
		]
	},

	{
		group: 'Wrong scenarios (Errors thrown)',
		cases: [
			{
				name: 'Missing beginning parenthesis',
				input: '( (selector(h2 > p)) and (content: "flex") ',
				error: 'Expected token: \')\''
			},
			{
				name: 'Missing ending parenthesis',
				input: '(selector(h2 > p)) and (content: "flex") )',
				error: 'Unexpected token: \')\''
			},
			{
				name: 'Unexpected token while parsing parentheses content',
				input: '(selector(h2 > p)) && (content: "flex") ',
				error: 'Unexpected token: \'&& (content: "flex") \''
			},
			{
				name: 'Unexpected token as default switch case',
				input: '(content: "flex") and and',
				error: 'Unexpected token: \'and\''
			},
			{
				name: 'Invalid supports syntax',
				input: '(content: "flex") and',
				error: 'Invalid supports syntax: \'(content: "flex") and\''
			},
		]
	}
];

/**
 * Run all test cases
 * @param {Function} parser - The parser function to test
 */

testCases.forEach((group) => {
	describe(group.group, () => {
		group.cases.forEach((test, index) => {
			it(test.name, () => {
				if ('expected' in test) {
					expect(parse(test.input)).toEqual(test.expected);
				} else {
					expect(() => parse(test.input)).toThrowError(test.error)
				}
			});
		});
	})
})

interface TestCase {
	group: string
	cases: Array<{
		name: string
		input: string
	} & ({
		error: string
	} | {
		expected: SupportsAST
	})>
}