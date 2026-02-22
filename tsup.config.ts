import { defineConfig } from 'tsup'

export default defineConfig([
  // ── Edge-safe middleware bundle ───────────────────────────────────────────
  // node-html-markdown is bundled so it runs in the Edge Runtime where
  // node_modules are not available at execution time.
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
    platform: 'neutral',
    target: 'es2020',
    noExternal: ['node-html-markdown'],
    external: ['next', 'next/server', 'react', 'react-dom'],
  },

  // ── Node.js-only bundles (config plugin + CLI) ────────────────────────────
  // These run at build/dev time in Node.js, not in the Edge Runtime,
  // so they can use fs, path, and other Node APIs.
  {
    entry: {
      'config-plugin': 'src/config-plugin.ts',
      cli: 'src/cli.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    splitting: false,
    platform: 'node',
    target: 'node18',
    external: ['next', 'next/server', 'react', 'react-dom'],
  },
])
