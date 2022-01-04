import type { JSDocTag, JSDocComment, ParameterDeclaration, Identifier } from 'typescript'
import { SyntaxKind } from 'typescript'

export type StringParam = {
  type: 'string'
  meta: {}
}

export type NumberParam = {
  type: 'number'
  meta: {
    minValue?: number
    maxValue?: number
    step?: number
  }
}

export type BooleanParam = {
  type: 'boolean'
  meta: {}
}

export type DateParam = {
  type: 'date'
  meta: {
    minDate?: string
    maxDate?: string
  }
}

export type Param = StringParam | NumberParam | DateParam | BooleanParam

export type ParamWithDescription = Param & {
  identifier: string
  label: string
  required: boolean
}

export type ParamMeta = Record<string, any>

export function getParamsMetaDataFromJSDoc(jsDocs: JSDocComment[]): ParamMeta {
  const meta: ParamMeta = {}
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

export function isDateParam(param: ParameterDeclaration): boolean {
  if (param.type?.kind !== SyntaxKind.TypeReference) {
    return false
  }
  // @ts-ignore
  return param.type?.typeName?.escapedText === 'Date'
}

export function getParamData(param: ParameterDeclaration, meta: ParamMeta): Param | undefined {
  if (param.type?.kind === SyntaxKind.StringKeyword) {
    return {
      type: 'string',
      meta: {},
    }
  }

  if (param.type?.kind === SyntaxKind.NumberKeyword) {
    return {
      type: 'number',
      meta: {
        maxValue: meta.maxValue ? Number.parseFloat(meta.maxValue) : undefined,
        minValue: meta.minValue ? Number.parseFloat(meta.minValue) : undefined,
        step: meta.step ? Number.parseFloat(meta.step) : undefined,
      },
    }
  }

  if (param.type?.kind === SyntaxKind.BooleanKeyword) {
    return {
      type: 'boolean',
      meta: {},
    }
  }

  if (isDateParam(param)) {
    return {
      type: 'date',
      meta: {
        maxDate: meta.maxDate,
        minDate: meta.minDate,
      },
    }
  }

  throw new Error(`Unknown ${param.type} for ${(param.name as Identifier).escapedText}`)
}
