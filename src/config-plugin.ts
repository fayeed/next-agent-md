import fs from 'node:fs'
import path from 'node:path'
import type { NextConfig } from 'next'

/**
 * next.config.js plugin that wires up next-agent-md.
 *
 * What it does:
 * - Injects `Vary: accept` response headers on all non-static routes so CDNs
 *   cache HTML and Markdown versions separately.
 * - On startup, checks whether a middleware/proxy file exists and prints a
 *   setup hint if not.
 *
 * To pre-generate Markdown for static pages after `next build`, add to package.json:
 *   "build": "next build && next-agent-md build"
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
export function withAgentMd(_pluginOptions: WithAgentMdOptions = {}) {
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
    }
  }
}

export interface WithAgentMdOptions {
  // Reserved for future options
}

function checkMiddlewareExists(): void {
  const cwd = process.cwd()
  // Next.js 16+ uses proxy.ts; older versions use middleware.ts
  const candidates = [
    'proxy.ts', 'proxy.js',
    'middleware.ts', 'middleware.js',
    'src/proxy.ts', 'src/proxy.js',
    'src/middleware.ts', 'src/middleware.js',
  ]

  const found = candidates.some((f) => fs.existsSync(path.join(cwd, f)))

  if (!found) {
    console.warn(
      [
        '',
        '  \x1b[33m⚠  next-agent-md\x1b[0m  No proxy.ts (or middleware.ts) found.',
        '  Run the following to scaffold it automatically:',
        '',
        '    \x1b[36mnpx next-agent-md init\x1b[0m',
        '',
      ].join('\n')
    )
  }
}
