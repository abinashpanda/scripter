import { compile } from '@scripter/core'
import { Plugin, ViteDevServer } from 'vite'

export default function scripter(): Plugin<unknown> {
  let server: ViteDevServer | undefined
  console.log('scripter')
  return {
    name: 'vite-scripter',
    apply: 'serve',
    configureServer(_server) {
      server = _server
    },
    config() {
      console.log('config')
    },
    configResolved() {
      console.log('configResolved')
    },
  }
}
