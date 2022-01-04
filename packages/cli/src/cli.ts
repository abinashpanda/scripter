#!/usr/bin/env node

/* eslint-disable no-console */

import * as path from 'path'
import { spawn } from 'child_process'
import { Command } from 'commander'
import { compile } from '@scripter/core'
import chokidar from 'chokidar'
import gradientString from 'gradient-string'
import chalk from 'chalk'

function delay(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

function resolvePath(relpath: string) {
  // @TODO: Update the resolvePath to work correctly with the build data
  return path.resolve(__dirname, '../../..', relpath)
}

/**
 * Start the server in watch mode for developement purpose.
 *
 * Right now, this function spawns a child process which runs the start:dev script
 * in the server package and pass the output directory location to the server using environment variable
 *
 * @TODO: Move it to a robust way to start the process
 * Right now I am not big fan of it. It looks very patchy and hacky, but it works.
 * So!!!!!, it is what it is for now.
 */
function startServerInWatchMode(outputDir: string) {
  const server = spawn('npm', ['run', 'start:dev'], {
    cwd: path.resolve(__dirname, '../../server'),
    env: { PATH: process.env.PATH, PORT: '3000', FUNCTIONS_OUTDIR: outputDir },
  })
  server.stdout.on('data', (data) => {
    // remove additional new lines
    console.log(Buffer.from(data).toString('utf-8').replace('\n', ''))
  })
  server.stderr.on('data', (data) => {
    // remove additional new lines
    console.error(Buffer.from(data).toString('utf-8').replace('\n', ''))
  })
  return server
}

async function main() {
  console.log(
    gradientString([
      { r: 255, g: 0, b: 125 },
      { r: 125, g: 0, b: 255 },
    ])('\n💻 SCRIPTER\n'),
  )

  const program = new Command()

  program
    .requiredOption('-f, --functions <path>', 'root directory containing the functions')
    .requiredOption('-o, --output <path>', 'build directory')

  program.parse(process.argv)

  const options = program.opts<{ functions: string; output: string }>()
  const { functions, output } = options
  const inputDir = resolvePath(functions)
  const outputDir = resolvePath(output)

  async function buildEverything() {
    console.log(chalk.blue('⌛ building...'))
    try {
      await compile(inputDir, outputDir)
      console.log(chalk.green('✅ build successfull'))
    } catch (error) {
      console.error('❌', error)
    }
  }

  await buildEverything()
  startServerInWatchMode(outputDir)

  chokidar
    .watch(inputDir, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100,
      },
    })
    // @TODO: Handle error
    .on('error', () => {})
    .on('change', async (fileChanged) => {
      // get the file path from the rootDir
      const filePath = fileChanged.replace(inputDir.endsWith('/') ? inputDir : `${inputDir}/`, '')
      console.log(chalk.blue(`📖 ${filePath} updated`))

      await buildEverything()
    })
}

main()
