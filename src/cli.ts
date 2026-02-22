#!/usr/bin/env node
/**
 * next-agent-md CLI
 *
 * Commands:
 *   init   — scaffold middleware.ts in the current Next.js project
 *   build  — pre-generate markdown files from static pages after next build
 */
import { buildStaticMarkdown } from './build'

const command = process.argv[2]

switch (command) {
  case 'init':
    runInit()
    break
  case 'build':
    runBuild()
    break
  default:
    printHelp()
}

// ── init ──────────────────────────────────────────────────────────────────────

import fs from 'node:fs'
import path from 'node:path'

const MIDDLEWARE_CONTENT = `import { withMarkdownForAgents } from 'next-agent-md'

export default withMarkdownForAgents()

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
`

function detectNextVersion(cwd: string): number {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'))
    const version: string = pkg.dependencies?.next ?? pkg.devDependencies?.next ?? ''
    const major = parseInt(version.replace(/[^0-9]/, ''), 10)
    return isNaN(major) ? 15 : major
  } catch {
    return 15
  }
}

function runInit(): void {
  const cwd = process.cwd()
  const nextMajor = detectNextVersion(cwd)

  // Next.js 16+ uses proxy.ts; older versions use middleware.ts
  const filename = nextMajor >= 16 ? 'proxy.ts' : 'middleware.ts'

  const useSrcDir = fs.existsSync(path.join(cwd, 'src'))
  const targetDir = useSrcDir ? path.join(cwd, 'src') : cwd
  const targetFile = path.join(targetDir, filename)
  const displayPath = useSrcDir ? `src/${filename}` : filename

  const existing = [
    'proxy.ts', 'proxy.js',
    'middleware.ts', 'middleware.js',
    path.join('src', 'proxy.ts'), path.join('src', 'proxy.js'),
    path.join('src', 'middleware.ts'), path.join('src', 'middleware.js'),
  ].map(f => path.join(cwd, f)).find((f) => fs.existsSync(f))

  if (existing) {
    const rel = path.relative(cwd, existing)
    console.log(`\n  \x1b[33m⚠  Skipped:\x1b[0m ${rel} already exists.\n`)
    console.log(`  To use next-agent-md, update it to:\n`)
    console.log(`  \x1b[90m${MIDDLEWARE_CONTENT}\x1b[0m`)
    return
  }

  fs.writeFileSync(targetFile, MIDDLEWARE_CONTENT, 'utf8')

  console.log(
    [
      '',
      `  \x1b[32m✔  Created ${displayPath}\x1b[0m`,
      '',
      '  AI agents can now request Markdown from any page:',
      '',
      '    \x1b[36mcurl -H "Accept: text/markdown" http://localhost:3000/\x1b[0m',
      '',
      '  Optional — also add the config plugin to next.config.ts:',
      '',
      "    \x1b[90mimport { withAgentMd } from 'next-agent-md/config'\x1b[0m",
      '    \x1b[90mexport default withAgentMd()(nextConfig)\x1b[0m',
      '',
      '  The config plugin auto-generates pre-built .md files after next build,',
      '  eliminating self-fetch overhead for static pages.',
      '',
    ].join('\n')
  )
}

// ── build ─────────────────────────────────────────────────────────────────────

async function runBuild(): Promise<void> {
  console.log('\n  \x1b[90mnext-agent-md\x1b[0m  Generating static markdown files…\n')

  try {
    const { generated, skipped } = await buildStaticMarkdown()

    if (generated.length === 0 && skipped.length === 0) {
      console.log('  No static pages found in build output. Skipping.\n')
      return
    }

    for (const route of generated) {
      console.log(`  \x1b[32m✔\x1b[0m  ${route}`)
    }

    if (skipped.length > 0) {
      console.log(`\n  \x1b[33m⚠  ${skipped.length} route(s) skipped\x1b[0m (HTML not found in build output):`)
      for (const route of skipped) {
        console.log(`       ${route}`)
      }
    }

    console.log(
      [
        '',
        `  \x1b[32m✔  ${generated.length} file(s) written to public/.well-known/markdown/\x1b[0m`,
        '',
        '  Static pages will be served from pre-built .md files.',
        '  Dynamic pages fall back to on-demand conversion.',
        '',
      ].join('\n')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`\n  \x1b[31m✖  Error:\x1b[0m ${message}\n`)
    process.exit(1)
  }
}

// ── help ──────────────────────────────────────────────────────────────────────

function printHelp(): void {
  console.log(
    [
      '',
      '  \x1b[1mnext-agent-md\x1b[0m',
      '',
      '  Commands:',
      '    \x1b[36minit\x1b[0m    Scaffold middleware.ts in your Next.js project',
      '    \x1b[36mbuild\x1b[0m   Pre-generate markdown for static pages after next build',
      '',
      '  Examples:',
      '    npx next-agent-md init',
      '    npx next-agent-md build',
      '',
    ].join('\n')
  )
}
