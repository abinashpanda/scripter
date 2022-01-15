import type { Statement, TypeAliasDeclaration } from 'typescript'
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

export function isTypeAliasDeclaration(statement: Statement): statement is TypeAliasDeclaration {
  return statement.kind === ts.SyntaxKind.TypeAliasDeclaration
}
