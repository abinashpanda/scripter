declare module 'virtual:scripter/entry' {
  export const allRoutes: { [key: string]: import('@scripter/core').Route }
  export const routes: import('@scripter/core').Route[]
}
