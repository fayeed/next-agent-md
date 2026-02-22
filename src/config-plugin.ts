import fs from 'node:fs'
import path from 'node:path'
import type { NextConfig } from 'next'
import { buildStaticMarkdown } from './build'

/**
 * next.config.js plugin that wires up next-agent-md with zero middleware boilerplate.
 *
 * What it does:
 * - Injects `Vary: accept` response headers on all non-static routes so CDNs
 *   cache HTML and Markdown versions separately.
 * - After `next build`, automatically pre-generates markdown files for all
 *   statically rendered pages into public/.well-known/markdown/ so the middleware
 *   can serve them instantly without a self-fetch round-trip.
 * - On startup, checks whether `middleware.ts` exists and prints a setup hint
 *   if not.
 *
 * @example
 * // next.config.ts
 * import { withAgentMd } from 'next-agent-md/config'
 * export default withAgentMd()(nextConfig)
 *
 * @example
 * // Composing with other plugins
 * import { withAgentMd } from 'next-agent-md/config'
 * import bundleAnalyzer from '@next/bundle-analyzer'
 * const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
 * export default withAgentMd()(withAnalyzer(nextConfig))
 */
export function withAgentMd(pluginOptions: WithAgentMdOptions = {}) {
  return function plugin(nextConfig: NextConfig = {}): NextConfig {
    checkMiddlewareExists()

    return {
      ...nextConfig,

      async headers() {
        const existingHeaders = await nextConfig.headers?.() ?? []
        return [
          ...existingHeaders,
          {
            source: '/((?!_next/static|_next/image|favicon.ico).*)',
            headers: [{ key: 'vary', value: 'accept' }],
          },
        ]
      },

      webpack(webpackConfig, context) {
        // Run the user's own webpack config first (if any)
        const config =
          typeof nextConfig.webpack === 'function'
            ? nextConfig.webpack(webpackConfig, context)
            : webpackConfig

        // Only run after a production build, and only on the server compilation
        // (webpack runs twice: once for server, once for client).
        // isServer + !dev ensures we run exactly once, at the end of `next build`.
        if (!context.isServer || context.dev) return config

        config.plugins = config.plugins ?? []
        config.plugins.push(new MarkdownBuildPlugin(pluginOptions))

        return config
      },
    }
  }
}

export interface WithAgentMdOptions {
  /** Where to write .md files, relative to project root. Default: 'public/.well-known/markdown' */
  outDir?: string
  /** Extra HTML tags to strip before conversion. Default: [] */
  stripSelectors?: string[]
}

/**
 * Webpack plugin that runs `buildStaticMarkdown()` after the server bundle
 * has been compiled (i.e. after `next build` finishes).
 */
class MarkdownBuildPlugin {
  private options: WithAgentMdOptions

  constructor(options: WithAgentMdOptions) {
    this.options = options
  }

  apply(compiler: { hooks: { done: { tapPromise: (name: string, fn: (stats: { hasErrors(): boolean }) => Promise<void>) => void } } }): void {
    compiler.hooks.done.tapPromise('MarkdownBuildPlugin', async (stats) => {
      if (stats.hasErrors()) return

      console.log('\n  \x1b[90mnext-agent-md\x1b[0m  Generating static markdown files…')

      try {
        const { generated, skipped } = await buildStaticMarkdown({
          outDir: this.options.outDir,
          stripSelectors: this.options.stripSelectors,
        })

        if (generated.length > 0) {
          console.log(
            `  \x1b[32m✔\x1b[0m  ${generated.length} static page(s) pre-built → public/.well-known/markdown/`
          )
        }

        if (skipped.length > 0) {
          console.log(
            `  \x1b[33m⚠\x1b[0m  ${skipped.length} route(s) skipped (HTML not found in build output)`
          )
        }

        if (generated.length === 0 && skipped.length === 0) {
          console.log('  No static pages found in build output.')
        }

        console.log('')
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.warn(`  \x1b[33m⚠  next-agent-md build skipped:\x1b[0m ${message}\n`)
      }
    })
  }
}

function checkMiddlewareExists(): void {
  const cwd = process.cwd()
  const candidates = [
    'middleware.ts',
    'middleware.js',
    'src/middleware.ts',
    'src/middleware.js',
  ]

  const found = candidates.some((f) => fs.existsSync(path.join(cwd, f)))

  if (!found) {
    console.warn(
      [
        '',
        '  \x1b[33m⚠  next-agent-md\x1b[0m  No middleware.ts found.',
        '  Run the following to scaffold it automatically:',
        '',
        '    \x1b[36mnpx next-agent-md init\x1b[0m',
        '',
      ].join('\n')
    )
  }
}
