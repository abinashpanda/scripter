export function Param(name: string, args?: any) {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {}
}
