import { Injectable } from '@nestjs/common'

const FUNCTIONS_OUTDIR = process.env.FUNCTIONS_OUTDIR as string

async function importFunctions() {
  const routes = require(FUNCTIONS_OUTDIR)
  // delete the cache
  delete require.cache[`${FUNCTIONS_OUTDIR}/index.js`]

  return routes
}

@Injectable()
export class FunctionsService {
  async getRoutes() {
    const functions = await importFunctions()
    return functions.routes
  }

  async executeFunction() {}
}
