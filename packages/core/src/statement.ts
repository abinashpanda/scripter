import type { Statement } from 'typescript'
import { SyntaxKind } from 'typescript'

export function isExportDefaultStatement(statement: Statement) {
  const { modifiers } = statement

  if (!modifiers) {
    return false
  }

  return (
    !!modifiers.find((modifier) => modifier.kind === SyntaxKind.ExportKeyword) &&
    !!modifiers.find((modifier) => modifier.kind === SyntaxKind.DefaultKeyword)
  )
}
