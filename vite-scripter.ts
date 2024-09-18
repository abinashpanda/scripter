import path from 'path'
import { Plugin } from 'vite'
import { watch } from 'chokidar'
import { createConsola } from 'consola'
import { colorize } from 'consola/utils'
import { compile } from './scripter/core'

const consola = createConsola()
const prefix = colorize('yellow', 'scripter')

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

      consola.info(`${prefix} - starting...`)

      const inputDir = path.resolve(__dirname, 'functions')
      const outputDir = path.resolve(__dirname, '.scripter-build')

      await compile(inputDir, outputDir)

      async function handleFileChange(file: string, update: 'updated' | 'deleted' | 'added') {
        const fileWithoutDir = file.replace(inputDir, '')
        switch (update) {
          case 'added': {
            consola.info(`${prefix} - file added: ${fileWithoutDir}`)
            break
          }
          case 'updated': {
            consola.info(`${prefix} - file updated: ${fileWithoutDir}`)
            break
          }
          case 'deleted': {
            consola.warn(`${prefix} - file deleted: ${fileWithoutDir}`)
          }
        }
        consola.start(`${prefix} - recompiling...`)
        await compile(inputDir, outputDir)
        consola.success(`${prefix} - recompiled`)
        server.ws.send('reload')
      }

      watch(inputDir, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100,
        },
      })
        // @TODO: Handle error
        .on('error', () => {})
        .on('change', (file) => {
          handleFileChange(file, 'updated')
        })
        .on('add', (file) => {
          handleFileChange(file, 'added')
        })
        .on('unlink', (file) => {
          handleFileChange(file, 'deleted')
        })
    },
  }
}
