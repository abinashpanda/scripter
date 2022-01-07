export function formatRoute(route: string) {
  return route.replace(/\//g, '~')
}
