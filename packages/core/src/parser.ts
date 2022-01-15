import {
  createSourceFile,
  ScriptTarget,
  isFunctionDeclaration,
  isExportAssignment,
  isVariableStatement,
  SyntaxKind,
  isTypeAliasDeclaration,
  isInterfaceDeclaration,
} from 'typescript'
import type {
  FunctionDeclaration,
  Identifier,
  ArrowFunction,
  FunctionExpression,
  ExportAssignment,
  JSDocTag,
  JSDocComment,
  TypeAliasDeclaration,
  InterfaceDeclaration,
} from 'typescript'
import { getParamData } from './param'
import type { ParamWithDescription } from './param'
import { isExportDefaultStatement } from './statement'

function parseFunctionParams(
  functionDeclaration: FunctionDeclaration | ArrowFunction | FunctionExpression,
  typeAliases: TypeAliasDeclaration[],
  interfaces: InterfaceDeclaration[],
) {
  if (!functionDeclaration) {
    throw new Error('No default scripter function found')
  }

  const paramDescriptions: ParamWithDescription[] = []

  for (const param of functionDeclaration.parameters) {
    const paramData = getParamData(param, typeAliases, interfaces)

    if (paramData) {
      paramDescriptions.push(paramData)
    }
  }

  return paramDescriptions
}

type FunctionMeta = {
  title?: string
  description?: string
}

function parseFunctionMetaFromDoc(doc: JSDocComment | undefined): FunctionMeta | undefined {
  if (!doc) {
    return undefined
  }

  // @ts-expect-error (as tags are not present in JSDocComment)
  const tags = (doc.tags ?? []) as JSDocTag[]
  const title = tags.find((tag) => tag.kind === SyntaxKind.JSDocTag && tag.tagName.escapedText === 'scripterTitle')
    ?.comment as string | undefined
  // @ts-expect-error (as comment field is not present in description)
  const description = doc.comment as string | undefined
  return {
    title,
    description,
  }
}

export function parse(fileContent: string) {
  // @TODO: Change the file name to something appropriate or take and input argument for it as well
  const sourceFile = createSourceFile('./function.ts', fileContent, ScriptTarget.ESNext)

  const { statements } = sourceFile

  let functionDeclaration: FunctionDeclaration | ArrowFunction | undefined

  let meta: FunctionMeta | undefined

  // This assumes that the function is exported as default and there is a single default declaration
  // if there would be multiple default declarations, we still don't care about others because the code is invalid
  // and won't compile, so getting wrong data doesn't matter in that case
  const exportDefaultStatement = statements.find(isExportAssignment)
  if (exportDefaultStatement) {
    const functionName = (exportDefaultStatement.expression as Identifier).escapedText as string | undefined
    /**
     * Handles the case
     *
     * function foo() {}
     *
     * export default foo
     */
    functionDeclaration = statements.find(
      (statement) => isFunctionDeclaration(statement) && statement.name?.escapedText === functionName,
    ) as FunctionDeclaration | undefined
    if (functionDeclaration) {
      // @ts-expect-error (jsDoc is not present in the FunctionDeclaration type definition)
      meta = parseFunctionMetaFromDoc(functionDeclaration?.jsDoc?.[0])
    }

    if (!functionDeclaration) {
      const variableStatements = statements.filter(isVariableStatement)
      for (const variableStatement of variableStatements) {
        let functionDeclarationFound = false
        const {
          declarationList: { declarations },
        } = variableStatement
        for (const declaration of declarations) {
          if ((declaration.name as Identifier).escapedText === functionName) {
            const initializer = declaration.initializer
            if (initializer?.kind === SyntaxKind.ArrowFunction) {
              functionDeclaration = initializer as ArrowFunction
              functionDeclarationFound = true
              break
            }
            if (initializer?.kind === SyntaxKind.FunctionExpression) {
              // @ts-expect-error
              // because the are some fields present in ArrowFunction which are not present
              // in FunctionExpress and we don't care about those
              functionDeclaration = initializer as FunctionExpression
              functionDeclarationFound = true
              break
            }
          }
        }

        if (functionDeclarationFound) {
          // @ts-expect-error (jsDoc is not present in the variableStatement type definition)
          meta = parseFunctionMetaFromDoc(variableStatement?.jsDoc?.[0])
        }
      }
    }
  }

  /**
   * Handles the case
   *
   * export default function foo() {}
   */
  if (!functionDeclaration) {
    functionDeclaration = statements.find(
      (statement) => isFunctionDeclaration(statement) && isExportDefaultStatement(statement),
    ) as FunctionDeclaration | undefined
    if (functionDeclaration) {
      // @ts-expect-error (jsDoc is not present in the FunctionDeclaration type definition)
      meta = parseFunctionMetaFromDoc(functionDeclaration?.jsDoc?.[0])
    }
  }

  /**
   * Handles the case
   *
   * export default () => {}
   */
  if (!functionDeclaration) {
    const exportDefaultStatement = statements.find(
      (statement) => isExportAssignment(statement) && statement.expression.kind === SyntaxKind.ArrowFunction,
    )
    if (exportDefaultStatement) {
      functionDeclaration = (exportDefaultStatement as ExportAssignment).expression as ArrowFunction
      // @ts-expect-error (jsDoc is not present in the ExportAssignment type definition)
      meta = parseFunctionMetaFromDoc(exportDefaultStatement?.jsDoc?.[0])
    }
  }

  if (!functionDeclaration) {
    throw new Error('No default scripter function found')
  }

  // sometimes the parameters of the function would depend on some of the type definitions (and interfaces)
  // defined in the file
  // in this version of scripter we won't support type unions (as we won't be sure to show the type of the UI for it), so we can't handle this case
  const typeAliases = statements.filter(isTypeAliasDeclaration)
  const interfaces = statements.filter(isInterfaceDeclaration)

  const params = parseFunctionParams(functionDeclaration, typeAliases, interfaces)
  return { params, meta }
}
