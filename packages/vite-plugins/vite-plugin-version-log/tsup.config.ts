import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  treeshake: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  outDir: 'dist',
  shims: true,
  dts: {
    resolve: true,
  },
})
