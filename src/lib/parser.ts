import * as path from 'path'
import * as fs from 'fs/promises'
import { SyntaxKind, createSourceFile, ScriptTarget, isFunctionDeclaration } from 'typescript'
import type {
  NodeArray,
  Statement,
  ModifiersArray,
  FunctionDeclaration,
  Identifier,
  JSDocComment,
  JSDocTag,
  ParameterDeclaration,
} from 'typescript'
import kebabCase from 'lodash/kebabCase'
import capitalize from 'lodash/capitalize'

function transformName(name: string) {
  return capitalize(kebabCase(name).split('-').join(' '))
}

function getParamsMetaDataFromJSDoc(jsDocs: JSDocComment[]) {
  const meta: Record<string, any> = {}
  // for the initial iteration we would only consider the first doc
  for (const doc of jsDocs) {
    // @ts-ignore
    const tags = (doc.tags ?? []) as JSDocTag[]
    for (const tag of tags) {
      meta[tag.tagName.escapedText as string] = tag.comment! as string
    }
  }
  return meta
}

function isDateParam(param: ParameterDeclaration): boolean {
  if (param.type?.kind !== SyntaxKind.TypeReference) {
    return false
  }
  // @ts-ignore
  return param.type?.typeName?.escapedText === 'Date'
}

type StringParam = {
  type: 'string'
  meta: {}
}

type NumberParam = {
  type: 'number'
  meta: {
    minValue?: number
    maxValue?: number
    step?: number
  }
}

type DateParam = {
  type: 'date'
  meta: {
    minDate?: string
    maxDate?: string
  }
}

type ScripterParam = (StringParam | NumberParam | DateParam) & {
  identifierName: string
  name: string
}

function isExportDefaultModifier(modifiers?: ModifiersArray) {
  if (!modifiers) {
    return false
  }
  return (
    !!modifiers.find((modifier) => modifier.kind === SyntaxKind.ExportKeyword) &&
    !!modifiers.find((modifier) => modifier.kind === SyntaxKind.DefaultKeyword)
  )
}

function parseFunctionArguments(statements: NodeArray<Statement>) {
  let functionDeclaration = statements.find(
    (statement) => isFunctionDeclaration(statement) && isExportDefaultModifier(statement.modifiers),
  ) as FunctionDeclaration | undefined

  if (!functionDeclaration) {
    throw new Error('No default scripter function found')
  }

  const functionName = functionDeclaration.name?.escapedText
  const paramDescriptions: ScripterParam[] = []

  for (const param of functionDeclaration.parameters) {
    const identifierName = (param.name as Identifier).escapedText as string

    // @ts-ignore
    const meta = getParamsMetaDataFromJSDoc(param.jsDoc ?? [])

    const name = transformName(meta.scripterParam ?? identifierName)

    if (param.type?.kind === SyntaxKind.StringKeyword) {
      paramDescriptions.push({
        identifierName,
        name,
        type: 'string',
        meta: {},
      })
    } else if (param.type?.kind === SyntaxKind.NumberKeyword) {
      paramDescriptions.push({
        identifierName,
        name,
        type: 'number',
        meta: {
          maxValue: meta.maxValue ? Number.parseFloat(meta.maxValue) : undefined,
          minValue: meta.minValue ? Number.parseFloat(meta.minValue) : undefined,
          step: meta.step ? Number.parseFloat(meta.step) : undefined,
        },
      })
    } else if (isDateParam(param)) {
      paramDescriptions.push({
        identifierName,
        name,
        type: 'date',
        meta: {
          maxDate: meta.maxDate,
          minDate: meta.minDate,
        },
      })
    }
  }

  return {
    functionName,
    paramDescriptions,
  }
}

async function parse(pathname: string) {
  const fileContent = await fs.readFile(pathname, 'utf8')

  const sourceFile = createSourceFile(pathname, fileContent, ScriptTarget.ESNext)
  console.log(JSON.stringify(parseFunctionArguments(sourceFile.statements), null, 2))
}

parse(path.resolve(__dirname, '../functions/fetch-people.ts'))
