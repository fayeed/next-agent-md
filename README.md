# next-agent-md

Next.js Edge Middleware that serves Markdown to AI agents — bringing [Cloudflare's Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/) pattern to any Next.js app.

When an AI agent sends `Accept: text/markdown`, the middleware intercepts the request, converts the page HTML to clean Markdown, and returns it with an `x-markdown-tokens` header. This reduces token usage by ~80%.

## Install

```bash
npm install next-agent-md
```

## Quick start

The fastest way to get started:

```bash
npx next-agent-md init
```

This scaffolds the correct file for your Next.js version and that's it.

> **Next.js version note**
> Next.js 16+ renamed the middleware file convention from `middleware.ts` to `proxy.ts`.
> The `init` command detects your version automatically and creates the right file.
> All code examples below use `proxy.ts` — replace with `middleware.ts` if you're on Next.js ≤ 15.

## Manual setup

### 1. Add the proxy/middleware file

**Next.js 16+** (`proxy.ts`):

```ts
// proxy.ts
import { withMarkdownForAgents } from 'next-agent-md'

export default withMarkdownForAgents()

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**Next.js ≤ 15** (`middleware.ts`):

```ts
// middleware.ts
import { withMarkdownForAgents } from 'next-agent-md'

export default withMarkdownForAgents()

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**Wrapping existing middleware:**

```ts
// proxy.ts (or middleware.ts on Next.js ≤ 15)
import { withMarkdownForAgents } from 'next-agent-md'
import { myAuthMiddleware } from './lib/auth'

export default withMarkdownForAgents(myAuthMiddleware, {
  contentSignal: { aiTrain: true, search: true, aiInput: true },
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### 2. Add the next.config plugin (optional but recommended)

```ts
// next.config.ts
import { withAgentMd } from 'next-agent-md/config'

export default withAgentMd()(nextConfig)
```

The config plugin:

- Injects `Vary: accept` on all non-static routes so CDNs cache HTML and Markdown separately
- Warns at startup if no `proxy.ts` or `middleware.ts` is found, with a pointer to `npx next-agent-md init`

**Composing with other plugins:**

```ts
import { withAgentMd } from 'next-agent-md/config'
import bundleAnalyzer from '@next/bundle-analyzer'

const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

export default withAgentMd()(withAnalyzer(nextConfig))
```

## How it works

1. Incoming request has `Accept: text/markdown`
2. Middleware self-fetches the same URL with `Accept: text/html` + an internal skip header (loop prevention)
3. Strips boilerplate HTML: `<nav>`, `<header>`, `<footer>`, `<aside>`, `<script>`, `<style>`, etc.
4. Converts cleaned HTML to Markdown via [`node-html-markdown`](https://github.com/crosstype/node-html-markdown)
5. Returns a `text/markdown` response with:
   - `x-markdown-tokens` — estimated token count (`chars / 4`)
   - `vary: accept` — tells CDNs to cache HTML and Markdown versions separately
   - `content-signal` — optional AI usage permissions header (see options)

## Options

```ts
interface MarkdownAgentsOptions {
  /** Header used to prevent infinite self-fetch loops. Default: 'x-markdown-skip' */
  skipHeader?: string

  /** Add `Vary: accept` to markdown responses. Default: true */
  varyHeader?: boolean

  /**
   * Controls the Content-Signal response header.
   * Pass true to enable all signals, or an object for fine-grained control.
   * Default: false (header not sent)
   *
   * @example contentSignal: true
   * // → Content-Signal: ai-train=yes, search=yes, ai-input=yes
   *
   * @example contentSignal: { aiTrain: false, search: true, aiInput: true }
   * // → Content-Signal: ai-train=no, search=yes, ai-input=yes
   */
  contentSignal?: boolean | {
    aiTrain?: boolean  // Default: true
    search?: boolean   // Default: true
    aiInput?: boolean  // Default: true
  }

  /** Extra HTML tag names to strip before conversion. Default: [] */
  stripSelectors?: string[]
}
```

## Testing

```bash
# Test Accept header
curl -H "Accept: text/markdown" http://localhost:3000/

# Check response headers
curl -sI -H "Accept: text/markdown" http://localhost:3000/ \
  | grep -E "content-type|x-markdown-tokens|vary|content-signal"
```

## Requirements

- Next.js ≥ 13.0.0 (tested on 15 and 16)
- Node.js ≥ 18.0.0
- Works in **Edge Runtime** (default for Next.js middleware/proxy)

| Next.js version | File convention |
| --- | --- |
| ≤ 15 | `middleware.ts` |
| 16+ | `proxy.ts` |

## License

MIT
