import { Injectable, NotFoundException } from '@nestjs/common'
import type { FunctionRoute, Route } from '@scripter/core'
import { ExecuteFunctionDto } from './functions.dto'

const FUNCTIONS_OUTDIR = process.env.FUNCTIONS_OUTDIR as string

async function importFunctions() {
  const routes = require(FUNCTIONS_OUTDIR)
  // delete the cache so that in the development mode we are always using the latest build
  // as the file imported is FUNCTIONS_OUTDIR/index.js we are have delete that cache
  // instead of just FUNCTIONS_OUTDIR
  delete require.cache[`${FUNCTIONS_OUTDIR}/index.js`]

  return routes as {
    routes: Route[]
    allRoutes: Record<string, FunctionRoute>
    functions: Record<string, { default: Function }>
  }
}

@Injectable()
export class FunctionsService {
  async getRoutes() {
    const functions = await importFunctions()
    return functions.routes
  }

  async executeFunction(executeFunctionDto: ExecuteFunctionDto) {
    const { route, data } = executeFunctionDto
    const functions = await importFunctions()
    const functionToExecute = functions.functions[route]
    const functionParams = functions.allRoutes[route]
    if (!functionToExecute || !functionParams) {
      throw new NotFoundException(`No function found for route ${route} found. Please check your functions directory`)
    }
    const inputParams = functionParams.params.map((param) => data[param.identifier])
    return functionToExecute.default(...inputParams)
  }
}
