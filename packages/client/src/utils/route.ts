import type { Route, FunctionRoute, ModuleRoute } from '@scripter/core'

// @TODO: Fix imports from @scripter/core library
export function isFunction(route: Route): route is FunctionRoute {
  return route.type === 'function'
}

export function isModule(route: Route): route is ModuleRoute {
  return route.type === 'module'
}

export function getModuleRoutes(routes: Route[]): ModuleRoute[] {
  const moduleRoutes = routes.filter(isModule)
  for (const moduleRoute of moduleRoutes) {
    const childrenRoutes = getModuleRoutes(moduleRoute.children)
    childrenRoutes.forEach((route) => {
      moduleRoutes.push(route)
    })
  }

  return moduleRoutes
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

export function formatRoute(route: string) {
  return route.replace(/\//g, '~')
}
