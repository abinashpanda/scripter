import path from 'path'
import { Plugin, normalizePath } from 'vite'
import esbuild from 'esbuild'
import { commonjs } from '@hyrious/esbuild-plugin-commonjs'
import { compileRoutes, getEntryFileContent } from './scripter/core'
import { pino } from 'pino'

function vModuleId(name: string) {
  return `virtual:scripter/${name}`
}

function resolvedVModuleId(name: string) {
  return `\0${vModuleId(name)}`
}

async function generateEntryFile(rootDir: string) {
  const routes = await compileRoutes(rootDir)
  const entryFile = getEntryFileContent(rootDir, routes)
  const output = await esbuild.build({
    stdin: {
      contents: entryFile,
      resolveDir: rootDir,
    },
    format: 'esm',
    logLevel: 'silent',
    bundle: true,
    write: false,
    platform: 'node',
    plugins: [commonjs()],
  })
  const text = output.outputFiles?.[0].text
  return text
}

export default function scripter(): Plugin<unknown> {
  let shouldRun = false
  const inputDir = path.resolve(__dirname, 'functions')

  return {
    name: 'vite-scripter',
    config(config) {
      shouldRun = !!config.ssr
    },
    resolveId: (id) => {
      if (id === vModuleId('entry')) {
        return resolvedVModuleId('entry')
      }
    },
    load: async (id) => {
      if (id === resolvedVModuleId('entry')) {
        return await generateEntryFile(inputDir)
      }
    },
    async configureServer(server) {
      if (!shouldRun) {
        return
      }
      const logger = pino({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            hostname: 'scripter',
            ignore: 'pid,hostname',
          },
        },
      })

      logger.info('scripter started')
      server.watcher.on('all', async (eventName, path) => {
        const normalizedPath = normalizePath(path)
        if (!normalizedPath.includes(inputDir)) {
          return
        }

        if (eventName === 'add') {
          logger.info(`file added: ${normalizedPath}`)
        } else if (eventName === 'change') {
          logger.info(`file updated: ${normalizedPath}`)
        } else if (eventName === 'unlink') {
          logger.warn(`file deleted: ${normalizedPath}`)
        } else if (eventName === 'unlinkDir') {
          logger.warn(`directory deleted: ${normalizedPath}`)
        }

        logger.info('updating functions')
        const entryModule = server.moduleGraph.getModuleById(resolvedVModuleId('entry'))
        if (entryModule) {
          server.moduleGraph.invalidateModule(entryModule)
        }
        server.ws.send('reload')
      })
    },
  }
}
