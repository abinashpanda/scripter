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
import { match } from 'ts-pattern'

export type BaseParam = {
  meta: object
}

export type StringParam = BaseParam & {
  type: 'string'
}

export type NumberParam = BaseParam & {
  type: 'number'
  meta: {
    minValue?: number
    maxValue?: number
    step?: number
  }
}

export type BooleanParam = BaseParam & {
  type: 'boolean'
}

export type DateParam = BaseParam & {
  type: 'date'
  meta: {
    minDate?: string
    maxDate?: string
  }
}

export type SelectParam = BaseParam & {
  type: 'select'
  options: { value: unknown; label: string }[]
}

export type TypeParam = BaseParam & {
  type: 'type'
  children: ParamWithDescription[]
}

export type Param = StringParam | NumberParam | DateParam | BooleanParam | SelectParam | TypeParam

export type ParamWithDescription = Param & {
  identifier: string
  label: string
  required: boolean
}

export type ParamMeta = Record<string, unknown>

export function getParamsMetaDataFromJSDoc(jsDocs: JSDocComment[]): ParamMeta {
  const meta: ParamMeta = {}
  // for the initial iteration we would only consider the first doc
  for (const doc of jsDocs) {
    // @ts-expect-error (tags is not present in the JSDocComment type definition)
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
  // @ts-expect-error (as jsDoc is not present in ParameterDeclaration)
  const jsDoc = param.jsDoc as JSDocComment[] | undefined
  const meta: ParamMeta = jsDoc ? getParamsMetaDataFromJSDoc(jsDoc) : {}

  const identifier = (param.name as Identifier).escapedText as string
  const label =
    (meta.scripterParam as string) ??
    // if no scripterParam is specified, convert the identifier to a label by splitting words and joining with a space
    upperFirst(words(identifier).map(lowerCase).join(' '))

  const required = !param.questionToken

  return match(param)
    .returnType<ParamWithDescription>()
    .with({ type: { kind: SyntaxKind.StringKeyword } }, () => ({
      identifier,
      label,
      required,
      type: 'string',
      meta: {},
    }))
    .with({ type: { kind: SyntaxKind.NumberKeyword } }, () => ({
      identifier,
      label,
      required,
      type: 'number',
      meta: {
        maxValue: meta.maxValue ? Number.parseFloat(meta.maxValue as string) : undefined,
        minValue: meta.minValue ? Number.parseFloat(meta.minValue as string) : undefined,
        step: meta.step ? Number.parseFloat(meta.step as string) : undefined,
      },
    }))
    .with({ type: { kind: SyntaxKind.BooleanKeyword } }, () => ({
      identifier,
      label,
      required,
      type: 'boolean',
      meta: {},
    }))
    .with({ type: { kind: SyntaxKind.TypeLiteral } }, (typeLiterParam) => {
      const paramData: ParamWithDescription = {
        identifier,
        label,
        required,
        type: 'type',
        meta: {},
        children: [],
      }

      const properties = (typeLiterParam.type as TypeLiteralNode).members.filter(isPropertySignature)

      for (const property of properties) {
        paramData.children.push(getParamData(property, typeAliases, interfaces, enums))
      }

      return paramData
    })
    .with({ type: { kind: SyntaxKind.TypeReference } }, (typeParam) => {
      const typeName = (typeParam.type as TypeReferenceNode).typeName
      if (typeName.kind !== SyntaxKind.Identifier) {
        throw new Error(`Unknown ${param.type} for ${(param.name as Identifier).escapedText}`)
      }
      const identifierName = typeName.escapedText

      if (identifierName === 'Date') {
        return {
          identifier,
          label,
          required,
          type: 'date',
          meta: {
            maxDate: meta.maxDate as string | undefined,
            minDate: meta.minDate as string | undefined,
          },
        }
      }

      // if the type is a enum then in that case we would return a select param
      const enumFound = enums.find((e) => e.name.escapedText === identifierName)
      if (enumFound) {
        const options: { value: unknown; label: string }[] = []
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
    })
    .otherwise(() => {
      throw new Error(`Unknown ${param.type} for ${(param.name as Identifier).escapedText}`)
    })
}
