import * as path from 'path'
import esbuild from 'esbuild'
import type { Route } from './route'
import { getRouteVariable, getFunctionRoutes } from './route'

export type Program = void

export function getEntryFileContent(rootId: string, routes: Route[]) {
  const functionRoutes = getFunctionRoutes(routes)
  // import all the functions in the entryFile and export all the named imports using functions variable
  const entryFile = `
    ${functionRoutes
      .map((functionRoute) => `import ${getRouteVariable(functionRoute.route)} from './${functionRoute.route}'`)
      .join('\n')}

    export const functions = {
      ${functionRoutes.map((functionRoute) => `${getRouteVariable(functionRoute.route)},`).join('\n')}
    }

    export const routes = ${JSON.stringify(routes, null, 2)}

    export const allRoutes = ${JSON.stringify(
      functionRoutes.reduce((acc, route) => {
        return {
          ...acc,
          [route.route]: route,
        }
      }, {}),
      null,
      2,
    )}
  `
  return entryFile
}

export async function compileProgram(rootDir: string, outputDir: string, routes: Route[]) {
  const entryFile = getEntryFileContent(rootDir, routes)
  return await esbuild.build({
    stdin: {
      contents: entryFile,
      resolveDir: rootDir,
    },
    format: 'cjs',
    logLevel: 'silent',
    outfile: path.resolve(outputDir, 'index.js'),
    bundle: true,
    platform: 'node',
  })
}
