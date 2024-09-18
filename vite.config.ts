import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'
import scripter from './vite-scripter'

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    scripter(),
    Inspect(),
  ],
})
