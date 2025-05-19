import { tokenize } from './tokenize';
import type { SupportsAST } from '../types';

export function parse(input: string): SupportsAST {
	let index = 0
	let tokens = tokenize(`${input}`);

	function parseBatch(nextType: ')' | ''): SupportsAST {
		let node = [parsePrimary()];
		let type: 'and' | 'or' | 'invalid' | undefined;
		let next: (typeof tokens)[0]

		while ((next = tokens[index++]) && (next.type === 'and' || next.type === 'or')) {
			type ||= next.type
			if (type !== next.type) {
				type = 'invalid'
			}
			node.push(parsePrimary())
		}

		if (nextType && nextType !== next?.type) {
			throw new Error(`Expected token: '${nextType}'`);
		} else if (next && next.type !== nextType) {
			throw new Error(`Unexpected token: '${next.value}'`);
		}

		node = node.flat();

		if (type) {
			return {
				type,
				node
			}
		} else {
			return node[0]
		}
	}

	function parsePrimary(): SupportsAST {
		const token = tokens[index++];

		switch (token?.type) {
			case '(':
				return parseBatch(')')
			
			case 'not':
				return {
					type: 'not',
					node: parsePrimary()
				}

			case 'invalid':
			case 'function':
			case 'declaration':
				return {
					type: token.type,
					node: token.value.replace(/\s/g, '').toLowerCase()
				}

			default:
				if (token?.value) {
					throw new Error(`Unexpected token: '${token.value}'`);
				}
		}

		throw new Error(`Invalid supports syntax: \'${input}\'`);
	}

	// return parsePrimary()
	return parseBatch('')
}