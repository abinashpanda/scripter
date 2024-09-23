import path from 'path'
import { Plugin, normalizePath } from 'vite'
import { compile } from './scripter/core'
import { pino } from 'pino'

export default function scripter(): Plugin<unknown> {
  let shouldRun = false

  return {
    name: 'vite-scripter',
    apply: 'serve',
    config(config) {
      shouldRun = !!config.ssr
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

      const inputDir = path.resolve(__dirname, 'functions')
      const outputDir = path.resolve(__dirname, '.scripter-build')

      logger.info('compiling functions')
      try {
        await compile(inputDir, outputDir)
        logger.info('compiled functions')

        server.watcher.on('all', async (eventName, path) => {
          const normalizedPath = normalizePath(path)

          if (normalizedPath.includes(outputDir)) {
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

          try {
            await compile(inputDir, outputDir)
            logger.info('recompiled functions')
            server.ws.send('reload')
          } catch (error) {
            logger.error('error recompiling functions', error)
          }
        })
      } catch (error) {
        logger.error('error compiling functions', error)
      }
    },
  }
}
