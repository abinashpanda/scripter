import type {
  JSDocTag,
  JSDocComment,
  ParameterDeclaration,
  Identifier,
  TypeReferenceNode,
  TypeAliasDeclaration,
  TypeLiteralNode,
  PropertySignature,
  InterfaceDeclaration,
} from 'typescript'
import * as ts from 'typescript'
import { upperFirst, words, lowerCase } from 'lodash'

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

export type TypeParam = {
  type: 'type'
  meta: {}
  children: ParamWithDescription[]
}

export type Param = StringParam | NumberParam | DateParam | BooleanParam | TypeParam

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

export function getParamData(
  param: ParameterDeclaration | ts.PropertySignature,
  typeAliases: TypeAliasDeclaration[],
  interfaces: InterfaceDeclaration[],
): ParamWithDescription | undefined {
  const jsDoc = (param as any).jsDoc as JSDocComment[] | undefined
  const meta: ParamMeta = jsDoc ? getParamsMetaDataFromJSDoc(jsDoc) : {}

  const identifier = (param.name as Identifier).escapedText as string
  const label =
    meta.scripterParam ??
    // if no scripterParam is specified, convert the identifier to a label by splitting words and joining with a space
    upperFirst(words(identifier).map(lowerCase).join(' '))

  const required = !param.questionToken

  if (param.type?.kind === ts.SyntaxKind.StringKeyword) {
    return {
      identifier,
      label,
      required,
      type: 'string',
      meta: {},
    }
  }

  if (param.type?.kind === ts.SyntaxKind.NumberKeyword) {
    return {
      identifier,
      label,
      required,
      type: 'number',
      meta: {
        maxValue: meta.maxValue ? Number.parseFloat(meta.maxValue) : undefined,
        minValue: meta.minValue ? Number.parseFloat(meta.minValue) : undefined,
        step: meta.step ? Number.parseFloat(meta.step) : undefined,
      },
    }
  }

  if (param.type?.kind === ts.SyntaxKind.BooleanKeyword) {
    return {
      identifier,
      label,
      required,
      type: 'boolean',
      meta: {},
    }
  }

  if (param.type.kind === ts.SyntaxKind.TypeReference) {
    const typeName = (param.type as TypeReferenceNode).typeName
    if (typeName.kind === ts.SyntaxKind.Identifier) {
      const identifierName = typeName.escapedText

      if (identifierName === 'Date') {
        return {
          identifier,
          label,
          required,
          type: 'date',
          meta: {
            maxDate: meta.maxDate,
            minDate: meta.minDate,
          },
        }
      }

      // if the identifier is not part of standard types, it is a custom type
      let typeDefinitionForParam: TypeAliasDeclaration | InterfaceDeclaration | undefined

      typeDefinitionForParam = typeAliases.find((alias) => alias.name.escapedText === identifierName)
      if (!typeDefinitionForParam) {
        typeDefinitionForParam = interfaces.find(
          (interfaceDeclaration) => interfaceDeclaration.name.escapedText === identifierName,
        )
      }
      if (!typeDefinitionForParam) {
        // @TODO: handle type imports in future version
        throw new Error(`No type definition for ${identifierName} found`)
      }

      const paramData: ParamWithDescription = {
        identifier,
        label,
        required,
        type: 'type',
        meta: {},
        children: [],
      }

      const members =
        typeDefinitionForParam.kind === ts.SyntaxKind.TypeAliasDeclaration
          ? (typeDefinitionForParam.type as TypeLiteralNode).members
          : typeDefinitionForParam.members
      for (const member of members) {
        if (member.kind === ts.SyntaxKind.PropertySignature) {
          const property = member as PropertySignature
          const paramDataForMember = getParamData(property, typeAliases, interfaces)
          if (paramDataForMember) {
            paramData.children.push(paramDataForMember)
          }
        }
      }

      return paramData
    }
  }

  throw new Error(`Unknown ${param.type} for ${(param.name as Identifier).escapedText}`)
}
