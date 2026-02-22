/**
 * Static markdown pre-generation.
 *
 * Reads the Next.js build output, finds all statically pre-rendered HTML files,
 * converts them to Markdown, and writes them to public/.well-known/markdown/
 * so the middleware can serve them directly without a self-fetch round-trip.
 *
 * Run automatically after `next build` via the withAgentMd() config plugin,
 * or manually with `npx next-agent-md build`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { stripBoilerplate } from './strip-boilerplate'
import { htmlToMarkdown } from './convert'

export interface BuildOptions {
  /** Next.js project root. Default: process.cwd() */
  cwd?: string
  /** Next.js build output directory. Default: '.next' */
  distDir?: string
  /** Where to write .md files, relative to cwd. Default: 'public/.well-known/markdown' */
  outDir?: string
  /** Extra tags to strip (passed through to stripBoilerplate). Default: [] */
  stripSelectors?: string[]
}

interface PrerenderManifest {
  version: number
  routes: Record<string, unknown>
  dynamicRoutes: Record<string, unknown>
}

export async function buildStaticMarkdown(options: BuildOptions = {}): Promise<BuildResult> {
  const cwd = options.cwd ?? process.cwd()
  const distDir = options.distDir ?? '.next'
  const outDir = options.outDir ?? path.join('public', '.well-known', 'markdown')
  const stripSelectors = options.stripSelectors ?? []

  const distPath = path.join(cwd, distDir)
  const outPath = path.join(cwd, outDir)

  // ── Validate build output exists ──────────────────────────────────────────
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Build output not found at ${distDir}/. Run \`next build\` first.`
    )
  }

  // ── Read prerender manifest to find static routes ─────────────────────────
  const manifestPath = path.join(distPath, 'prerender-manifest.json')
  if (!fs.existsSync(manifestPath)) {
    return { generated: [], skipped: [] }
  }

  const manifest: PrerenderManifest = JSON.parse(
    fs.readFileSync(manifestPath, 'utf8')
  )

  const staticRoutes = Object.keys(manifest.routes)
  if (staticRoutes.length === 0) {
    return { generated: [], skipped: [] }
  }

  // ── Find HTML files for each static route ─────────────────────────────────
  const generated: string[] = []
  const skipped: string[] = []

  fs.mkdirSync(outPath, { recursive: true })

  for (const route of staticRoutes) {
    const html = findHtmlForRoute(distPath, route)
    if (!html) {
      skipped.push(route)
      continue
    }

    const markdown = htmlToMarkdown(stripBoilerplate(html, stripSelectors))

    // Write to outDir, nested paths become nested dirs
    // e.g. /blog/hello → public/.well-known/markdown/blog/hello.md
    const slug = route === '/' ? 'index' : route.replace(/^\//, '')
    const mdFile = path.join(outPath, `${slug}.md`)

    fs.mkdirSync(path.dirname(mdFile), { recursive: true })
    fs.writeFileSync(mdFile, markdown, 'utf8')
    generated.push(route)
  }

  return { generated, skipped }
}

export interface BuildResult {
  generated: string[]
  skipped: string[]
}

/**
 * Finds the pre-rendered HTML for a given route from the Next.js build output.
 * Checks App Router paths first, then Pages Router paths.
 */
function findHtmlForRoute(distPath: string, route: string): string | null {
  const slug = route === '/' ? 'index' : route.replace(/^\//, '')

  const candidates = [
    // App Router: .next/server/app/[route]/page.html or .next/server/app/[route].html
    path.join(distPath, 'server', 'app', slug, 'page.html'),
    path.join(distPath, 'server', 'app', `${slug}.html`),
    path.join(distPath, 'server', 'app', slug, 'index.html'),
    // Pages Router: .next/server/pages/[route].html
    path.join(distPath, 'server', 'pages', `${slug}.html`),
    path.join(distPath, 'server', 'pages', slug, 'index.html'),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, 'utf8')
    }
  }

  return null
}

/**
 * Returns the public URL path for a pre-built markdown file.
 * Used by the middleware to check if a fast-path file exists.
 *
 * e.g. pathname '/blog/hello' → '/.well-known/markdown/blog/hello.md'
 */
export function markdownPublicPath(pathname: string): string {
  const slug = pathname === '/' ? 'index' : pathname.replace(/^\//, '')
  return `/.well-known/markdown/${slug}.md`
}
