/**
 * Regular expression to match CSS media query logical operators
 * - Matches whole words only (using word boundaries)
 * - Case sensitive
 * - Global flag for iterative matching
 */
const operatorPattern = /\b(not|and|or)\b/g

/**
 * Regular expression to match CSS media query conditions
 * - Matches any characters except colons and parentheses
 * - Useful for extracting feature names before separators
 * - Global flag for iterative matching
 */
const conditionPattern = /[^:()]*/g

/**
 * Tokenizes a CSS media query string into logical tokens
 * @param input - The media query string to tokenize
 * @returns {Tokens} Array of tokens with type and value
 * 
 * @example
 * tokenize('(width >= 600px) and not (color: red)')
 * // Returns:
 * // [
 * //   { type: 'parenthesis', value: '(' },
 * //   { type: 'feature', value: 'width >= 600px', left: 'width', right: '>= 600px' },
 * //   { type: 'parenthesis', value: ')' },
 * //   { type: 'operator', value: 'and' },
 * //   { type: 'operator', value: 'not' },
 * //   { type: 'parenthesis', value: '(' },
 * //   { type: 'feature', value: 'color: red', left: 'color', right: 'red' },
 * //   { type: 'parenthesis', value: ')' }
 * // ]
 */
export function tokenize(input: string): Tokens {
	let ref = { text: '', index: 0 };
	let char = 0; // Current position in the input string
	const tokens: Tokens = [];
	
	while (char < input.length) {
		let sCurr = input[char];

		// Skip whitespace characters (space, tab, newline)
		if (!/\s/.test(sCurr)) {
			// Handle parentheses as individual tokens
			if (sCurr === '(' || sCurr === ')') {
				// Add the parenthesis as a token
				tokens.push({ type: sCurr, value: sCurr });
				// Move past this parenthesis in the input
				char++;
				continue;
			}

			// Try matching operators first
			if (match(operatorPattern, input, char, ref) && ref.index === char) {
				// Add the operator as a token
				tokens.push({ type: ref.text as Token['type'], value: ref.text });
				char += ref.text.length;
				continue;
			}

			// Then try matching conditions/features
			if (match(conditionPattern, input, char, ref)) {
				tokens.push(extractMediaFeature(input, char, ref.text))
				char += tokens[tokens.length - 1].value.length
				continue;
			}
		}

		// If nothing matched, advance to prevent infinite loops
		char++;
	}

	return tokens;
}

/**
 * Tests a string against a regular expression and captures the matched text
 * @param {string} input - The string to test against the pattern
 * @param {RegExp} pattern - Regular expression to match (must have global flag if used repeatedly)
 * @param {Object} [capture] - Optional object to store match results
 * @param {string} [capture.text] - Will contain the full matched text if provided
 * @param {string[]} [capture.groups] - Will contain captured groups if provided
 * @returns {boolean} True if the pattern matches, false otherwise
 * 
 * @example
 * // Simple match test
 * const result = match('Hello world', /world/);
 * // result → true
 * 
 * @example
 * // With capture object
 * const capture = {};
 * match('CSS: rgb(255,0,0)', /rgb\(([^)]+)\)/, capture);
 * // capture.text → "rgb(255,0,0)"
 * // capture.groups → ["255,0,0"]
 */
function match(
  regex: RegExp,
  input: string,
	index: number,
  capture: { text: string, index: number }
): boolean {
  regex.lastIndex = index;

  const _result = regex.exec(input);
		if (_result && _result[0]) {
		capture.text = _result[0];
		capture.index = _result.index
		return true;
	}

  return false;
}

/**
 * Extracts a media feature token from CSS input string.
 * Handles functions (parentheses), declarations (colon), and simple values.
 * 
 * @param input - The full CSS input string
 * @param begins - Starting position of the feature in the input string
 * @param left - The left-hand part (name) of the feature
 * @returns Parsed token with type and value information
 * 
 * @example
 * // Function type
 * extractMediaFeature('transform(rotate(45deg))', 0, 'transform')
 * // Returns: { type: 'function', value: 'transform(rotate(45deg))', left: 'transform', right: 'rotate(45deg)' }
 * 
 * @example
 * // Declaration type
 * extractMediaFeature('color: red)', 0, 'color')
 * // Returns: { type: 'declaration', func: false, left: 'color', right: 'red', value: 'color: red' }
 * 
 * @example
 * // Value type
 * extractMediaFeature('inherit', 0, 'inherit')
 * // Returns: { type: 'invalid', value: 'inherit' }
 */
function extractMediaFeature(input: string, begins: number, left: string): Token | MediaToken {
	let ref = { text: '', index: 0 };
	let ends = begins + left.length
	let curr = input[ends];

	// Determine token type based on separator character
	let func = curr !== ':'
	let type = 'function' as MediaToken['type'];
	if (curr === ':') {
		type = 'declaration';
	} else if (curr !== '(') {
		// Return simple value token if invalid separator found
		return { type: 'invalid', value: left };
	}

	// Find the end of the feature by balancing parentheses and handling strings
	let parenCount = 0;
	while (ends < input.length) {
		curr = input[ends];

		if (curr === '\'' || curr === '"' || curr === '`') {
			// Handle quoted strings (skip content until matching quote)
			let regex = RegExp('(?<!\\\\)(?:(\\\\\\\\)*)\\' + curr, 'g')
			if (match(regex, input, ends + 1, ref)) {
				ends = ref.index;
			} else {
				type = 'invalid'
			}
		} else if (curr === '(') {
			parenCount++;
		} else if (curr === ')') {
			if (parenCount === 0) break;
			parenCount--;
		}

		ends++
	}

	// Extract the full value
	const value = input.slice(begins, ends)
	// Extract right part (content inside parentheses/after colon)
	const right = value.slice(left.length + 1, (type === 'function' ? -1 : undefined)).trim()

	return { type, func, left, right, value };
}

interface Token<T = 'invalid' | '(' | ')' | 'not' | 'and' | 'or'> {
	type: T;
	value: string
}
interface MediaToken extends Token<'invalid' | 'function' | 'declaration'> {
	func: boolean
	left: string
	right: string
}

type Tokens = Array<Token | MediaToken>