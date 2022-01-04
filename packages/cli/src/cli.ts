#!/usr/bin/env node

/* eslint-disable no-console */

import * as path from 'path'
import { Command } from 'commander'
import { compile } from '@scripter/core'
import chokidar from 'chokidar'
import chalkAnimation from 'chalk-animation'
import chalk from 'chalk'

function resolvePath(relpath: string) {
  // @TODO: Update the resolvePath to work correctly with the build data
  return path.resolve(__dirname, '../../..', relpath)
}

function delay(duration: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

async function main() {
  const anim = chalkAnimation.rainbow('\n SCRIPTER \n')
  await delay(1000)
  anim.stop()

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
    console.log(chalk.green('⌛ building...'))
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
    .on('change', buildEverything)
}

main()
