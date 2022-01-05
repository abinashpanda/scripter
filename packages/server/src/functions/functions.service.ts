import { Injectable, NotFoundException } from '@nestjs/common'
import type { FunctionRoute, Route } from '@scripter/core'
import { words } from 'lodash'
import { ExecuteFunctionDto } from './functions.dto'

const FUNCTIONS_OUTDIR = process.env.FUNCTIONS_OUTDIR as string

// @TODO: import this function from @scripter/core
function getRouteVariable(route: string) {
  return words(route).join('_')
}

function importFunctions() {
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
    const functions = importFunctions()
    return functions.routes
  }

  async getRoute(route: string) {
    const functions = importFunctions()
    const { allRoutes } = functions
    // the route send by client would be containing ~ instead of /
    // otherwise it would be difficult for finding correct service for nested routes
    // assuming the function route is users/delete-user
    // so doing a GET request for functions/routes/users/delete-user won't call the getRoute controller
    // but functions/routes/users~delete-user would
    const formattedRoute = route.replace(/~/g, '/')
    const routeFound = allRoutes[formattedRoute]
    if (!routeFound) {
      throw new NotFoundException(
        `No function found for route ${formattedRoute} found. Please check your functions directory`,
      )
    }
    return routeFound
  }

  async executeFunction(executeFunctionDto: ExecuteFunctionDto) {
    const { route, data } = executeFunctionDto
    const functions = importFunctions()
    const formattedRoute = route.replace(/~/g, '/')
    const functionVariableName = getRouteVariable(formattedRoute)
    const functionToExecute = functions.functions[functionVariableName]
    const functionParams = functions.allRoutes[formattedRoute]
    if (!functionToExecute || !functionParams) {
      throw new NotFoundException(`No function found for route ${route} found. Please check your functions directory`)
    }
    const inputParams = functionParams.params.map((param) => data[param.identifier])
    return functionToExecute.default(...inputParams)
  }
}
