# CSS @supports Parser

[![npm version](https://img.shields.io/npm/v/css-supports-parser)](https://www.npmjs.com/package/css-supports-parser)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Tests](https://github.com/moa-io/css-supports-parser/actions/workflows/tests.yml/badge.svg)](https://github.com/moa-io/css-supports-parser/actions/workflows/tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/moa-io/css-supports-parser/badge.svg)](https://coveralls.io/github/moa-io/css-supports-parser)

A robust TypeScript parser for CSS `@supports` conditions that evaluates whether specific features would pass the condition, handling complex logical expressions including feature queries and nested logical operators.

## Purpose

This parser was specifically developed to:
- Eliminate false warnings from `stylelint-no-unsupported-browser-features` 
- Accurately analyze CSS features wrapped in `@supports` conditions
- Enable proper validation of progressive enhancement patterns

## Features

- ✅ Accurate parsing of all valid CSS `@supports` syntax
- 🔍 Handles complex logical expressions (`and`, `or`, `not`)
- 🏗️ Supports nested conditions with parentheses
- 🚀 Evaluates both declarations (`property: value`) and functions
- 🚦 Returns three-state evaluation (true/false/undefined)
- 📦 Zero dependencies
- 🧪 100% test coverage with Vitest

## Installation

```bash
npm install css-supports-parser
# or 
yarn add css-supports-parser
# or 
pnpm add css-supports-parser
```

## Usage

### Basic Usage

```typescript
import { SupportsParser } from 'css-supports-parser';

const parser = new SupportsParser('(display: grid) or (not (color: #bad))');

// Check specific features
parser.checkProperty('display: grid'); // true
parser.checkProperty('color: #bad');   // false
parser.checkProperty('width: 100px');  // undefined (not mentioned)
```

### Advanced Usage

```typescript
// Complex condition with nested expressions
const parser = new SupportsParser(
  '((display: flex) or (display: grid)) and (not (color: #bad))'
);

// Silent mode (won't throw on parse errors)
const silentParser = new SupportsParser('invalid condition', true);

// With @supports prefix
const prefixedParser = new SupportsParser('@supports (display: flex)');
```

## API

### `SupportsParser`

#### `constructor(condition: string, silent: boolean = false)`
- `condition`: The CSS `@supports` condition to parse
- `silent`: If `true`, suppresses parsing errors (returns empty AST instead)

#### `checkProperty(feature: string): boolean | undefined`
Evaluates whether a feature would pass the condition.

- Returns `true` if the feature matches and would pass
- Returns `false` if the feature matches but would fail (e.g., in a `not` clause)
- Returns `undefined` if the feature isn't mentioned in the condition


## Examples

### Evaluating Different Conditions

```typescript
// Simple declaration
new SupportsParser('(display: grid)').checkProperty('display:grid'); // true

// With NOT operator
new SupportsParser('not (display: grid)').checkProperty('display:grid'); // false

// Complex condition
const parser = new SupportsParser(
  '(display: grid) and (not (color: #bad) or (width: 100px))'
);
parser.checkProperty('display:grid'); // true
parser.checkProperty('color:#bad');   // false
parser.checkProperty('width:100px');  // true
```

## Development

### Setup

```bash
git clone https://github.com/moa-io/css-supports-parser.git
cd css-supports-parser
pnpm install
```

### Running Tests

```bash
pnpm test
# or for watch mode
pnpm test:watch
```

### Building

```bash
pnpm build
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

ISC © [Mohammad Alawadly](https://github.com/moa-io)
