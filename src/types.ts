export type SupportsAST = {
  type: 'invalid' | 'function' | 'declaration',
  node: string
} | {
  type: 'not',
  node: SupportsAST
} | {
  type: 'and' | 'or' | 'invalid',
  node: Array<SupportsAST>
}

