import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  platform: 'neutral',
  target: 'es2020',
  // node-html-markdown must be bundled so it runs in Edge Runtime
  // where node_modules are not available at execution time
  noExternal: ['node-html-markdown'],
  external: ['next', 'next/server', 'react', 'react-dom'],
})
