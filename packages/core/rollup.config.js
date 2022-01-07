import typescript from 'rollup-plugin-typescript2'

/** @type {import('rollup').RollupOptions} */
const config = {
  input: './src/index.ts',
  output: [
    {
      format: 'esm',
      sourcemap: true,
      dir: 'esm-build',
    },
    {
      format: 'cjs',
      sourcemap: true,
      dir: 'build',
    },
  ],
  plugins: [typescript()],
}

export default config
