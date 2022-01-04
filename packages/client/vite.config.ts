import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import defaultTheme from 'tailwindcss/defaultTheme'
import { colors } from './theme'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    process: {},
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@font-size-base': '13px',
          '@primary-color': colors.blue['600'],
          '@layout-body-background': colors.gray['50'],
          '@layout-header-background': colors.gray['900'],
          '@layout-trigger-background': colors.gray['900'],
          '@border-color-base': colors.gray['200'],
          '@text-color': colors.gray['700'],
          // @ts-ignore
          '@font-family': ['Inter', ...defaultTheme.fontFamily.sans].join(', '),
          '@border-radius-base': '4px',
        },
      },
    },
  },
  server: {
    port: 3001,
  },
})
