#!/usr/bin/env node

/* eslint-disable no-console */

import * as path from 'path'
import { Command } from 'commander'
import { compile } from '@scripter/core'
import chokidar from 'chokidar'
import gradientString from 'gradient-string'
import chalk from 'chalk'

function resolvePath(relpath: string) {
  // @TODO: Update the resolvePath to work correctly with the build data
  return path.resolve(__dirname, '../../..', relpath)
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

  buildEverything()
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
    .on('change', (fileChanged) => {
      // get the file path from the rootDir
      const filePath = fileChanged.replace(inputDir.endsWith('/') ? inputDir : `${inputDir}/`, '')
      console.log(chalk.blue(`📖 ${filePath} updated`))

      buildEverything()
    })
}

main()
