import { createSourceFile, ScriptTarget, isFunctionDeclaration, JSDocComment } from 'typescript'
import type { NodeArray, Statement, FunctionDeclaration, Identifier } from 'typescript'
import { upperFirst, words, lowerCase } from 'lodash'
import { getParamData, getParamsMetaDataFromJSDoc } from './param'
import type { ParamMeta, ParamWithDescription } from './param'
import { isExportDefaultStatement } from './statement'

function parseFunction(statements: NodeArray<Statement>): { functionName?: string; params: ParamWithDescription[] } {
  const functionDeclaration = statements.find(
    (statement) => isFunctionDeclaration(statement) && isExportDefaultStatement(statement),
  ) as FunctionDeclaration | undefined

  if (!functionDeclaration) {
    throw new Error('No default scripter function found')
  }

  const functionName = functionDeclaration.name?.escapedText as string | undefined
  const paramDescriptions: ParamWithDescription[] = []

  for (const param of functionDeclaration.parameters) {
    const identifier = (param.name as Identifier).escapedText as string

    const jsDoc = (param as any).jsDoc as JSDocComment[] | undefined
    const meta: ParamMeta = jsDoc ? getParamsMetaDataFromJSDoc(jsDoc) : {}
    const paramData = getParamData(param, meta)

    if (paramData) {
      const label =
        meta.scripterParam ??
        // if no scripterParam is specified, convert the identifier to a label by splitting words and joining with a space
        upperFirst(words(identifier).map(lowerCase).join(' '))

      paramDescriptions.push({
        identifier,
        label,
        required: !param.questionToken,
        ...paramData,
      })
    }
  }

  return {
    functionName,
    params: paramDescriptions,
  }
}

export function parse(fileContent: string) {
  // @TODO: Change the file name to something appropriate or take and input argument for it as well
  const sourceFile = createSourceFile('./function.ts', fileContent, ScriptTarget.ESNext)
  return parseFunction(sourceFile.statements)
}
