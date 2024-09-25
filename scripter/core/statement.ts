import type { FunctionDeclaration } from 'typescript'
import { SyntaxKind } from 'typescript'

export function isExportDefaultStatement(statement: FunctionDeclaration) {
  const modifiers = statement.modifiers

  if (!modifiers) {
    return false
  }

  return (
    !!modifiers.find((modifier) => modifier.kind === SyntaxKind.ExportKeyword) &&
    !!modifiers.find((modifier) => modifier.kind === SyntaxKind.DefaultKeyword)
  )
}
