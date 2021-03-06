import type {
  JSDocTag,
  JSDocComment,
  ParameterDeclaration,
  Identifier,
  TypeReferenceNode,
  TypeAliasDeclaration,
  TypeLiteralNode,
  InterfaceDeclaration,
  PropertySignature,
  EnumDeclaration,
  StringLiteral,
  NumericLiteral,
} from 'typescript'
import { isPropertySignature, SyntaxKind } from 'typescript'
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

export type SelectParam = {
  type: 'select'
  meta: {}
  options: { value: any; label: string }[]
}

export type TypeParam = {
  type: 'type'
  meta: {}
  children: ParamWithDescription[]
}

export type Param = StringParam | NumberParam | DateParam | BooleanParam | SelectParam | TypeParam

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
  param: ParameterDeclaration | PropertySignature,
  typeAliases: TypeAliasDeclaration[],
  interfaces: InterfaceDeclaration[],
  enums: EnumDeclaration[],
): ParamWithDescription {
  const jsDoc = (param as any).jsDoc as JSDocComment[] | undefined
  const meta: ParamMeta = jsDoc ? getParamsMetaDataFromJSDoc(jsDoc) : {}

  const identifier = (param.name as Identifier).escapedText as string
  const label =
    meta.scripterParam ??
    // if no scripterParam is specified, convert the identifier to a label by splitting words and joining with a space
    upperFirst(words(identifier).map(lowerCase).join(' '))

  const required = !param.questionToken

  if (param.type?.kind === SyntaxKind.StringKeyword) {
    return {
      identifier,
      label,
      required,
      type: 'string',
      meta: {},
    }
  }

  if (param.type?.kind === SyntaxKind.NumberKeyword) {
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

  if (param.type?.kind === SyntaxKind.BooleanKeyword) {
    return {
      identifier,
      label,
      required,
      type: 'boolean',
      meta: {},
    }
  }

  if (param.type.kind === SyntaxKind.TypeReference) {
    const typeName = (param.type as TypeReferenceNode).typeName
    if (typeName.kind === SyntaxKind.Identifier) {
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

      // if the type is a enum then in that case we would return a select param
      const enumFound = enums.find((e) => e.name.escapedText === identifierName)
      if (enumFound) {
        const options: { value: any; label: string }[] = []
        let index = 0
        for (const member of enumFound.members) {
          if (member.name.kind !== SyntaxKind.Identifier) {
            throw new Error(`Enum member ${member.name.getText()} is not an identifier`)
          }
          const label = member.name.escapedText.toString()
          let value: number | string = index
          if (member.initializer) {
            if (
              member.initializer.kind !== SyntaxKind.StringLiteral &&
              member.initializer.kind !== SyntaxKind.NumericLiteral
            ) {
              throw new Error(`Enum member ${member.name.getText()} is not a string or a numeric literal`)
            }
            value = (member.initializer as StringLiteral | NumericLiteral).text
          }

          index += 1

          options.push({
            label,
            value,
          })
        }

        return {
          identifier,
          label,
          required,
          type: 'select',
          meta: {},
          options,
        }
      }

      // if the identifier is not part of standard types, it is a custom type
      let typeDefinitionForParam: TypeAliasDeclaration | InterfaceDeclaration | EnumDeclaration | undefined

      // first check for type aliases
      typeDefinitionForParam = typeAliases.find((alias) => alias.name.escapedText === identifierName)
      // then check for interfaces
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
        typeDefinitionForParam.kind === SyntaxKind.TypeAliasDeclaration
          ? (typeDefinitionForParam.type as TypeLiteralNode).members
          : typeDefinitionForParam.members
      const properties = members.filter(isPropertySignature)

      for (const property of properties) {
        paramData.children.push(getParamData(property, typeAliases, interfaces, enums))
      }

      return paramData
    }
  }

  if (param.type.kind === SyntaxKind.TypeLiteral) {
    const paramData: ParamWithDescription = {
      identifier,
      label,
      required,
      type: 'type',
      meta: {},
      children: [],
    }

    const properties = (param.type as TypeLiteralNode).members.filter(isPropertySignature)

    for (const property of properties) {
      paramData.children.push(getParamData(property, typeAliases, interfaces, enums))
    }

    return paramData
  }

  throw new Error(`Unknown ${param.type} for ${(param.name as Identifier).escapedText}`)
}
