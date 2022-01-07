import type { Statement } from 'typescript'
import * as ts from 'typescript'

export function isExportDefaultStatement(statement: Statement) {
  const { modifiers } = statement

  if (!modifiers) {
    return false
  }

  return (
    !!modifiers.find((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
    !!modifiers.find((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)
  )
}
