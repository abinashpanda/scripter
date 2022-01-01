import { capitalize, words } from 'lodash'

export type FunctionRoute = {
  type: 'function'
  title: string
  description?: string
  route: string
}

export type ModuleRoute = {
  type: 'module'
  title: string
  route: string
  children: Route[]
}

export type Route = FunctionRoute | ModuleRoute

export function isFunction(route: Route): route is FunctionRoute {
  return route.type === 'function'
}

export function isModule(route: Route): route is ModuleRoute {
  return route.type === 'module'
}

export function getRouteVariable(route: string) {
  return words(route).join('_')
}

export function getRouteTitle(name: string) {
  return capitalize(words(name).join(' '))
}

export function resolveRoute(route: string, parentRoute?: string) {
  return typeof parentRoute !== 'undefined' ? `${parentRoute}/${route}` : route
}

export function getFunctionRoutes(routes: Route[]): FunctionRoute[] {
  const functionRoutes = routes.filter(isFunction)
  const moduleRoutes = routes.filter(isModule)
  for (const moduleRoute of moduleRoutes) {
    const childrenRoutes = getFunctionRoutes(moduleRoute.children)
    childrenRoutes.forEach((route) => {
      functionRoutes.push(route)
    })
  }

  return functionRoutes
}
