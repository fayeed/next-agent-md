# next-agent-md

Next.js Edge Middleware that serves Markdown to AI agents — bringing [Cloudflare's Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/) pattern to any Next.js app.

When an AI agent sends `Accept: text/markdown` (or appends `?markdown=1`), the middleware intercepts the request, converts the page HTML to clean Markdown, and returns it with an `x-markdown-tokens` header. This reduces token usage by ~80%.

## Install

```bash
npm install next-agent-md
```

## Usage

**Zero-config** (no existing middleware):

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
// middleware.ts
import { withMarkdownForAgents } from 'next-agent-md'
import { myAuthMiddleware } from './lib/auth'

export default withMarkdownForAgents(myAuthMiddleware, {
  varyHeader: true,
  contentSignal: true,
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

## How it works

1. Incoming request has `Accept: text/markdown` or `?markdown=1`
2. Middleware self-fetches the same URL with `Accept: text/html` + an internal skip header (loop prevention)
3. Strips boilerplate HTML: `<nav>`, `<header>`, `<footer>`, `<aside>`, `<script>`, `<style>`, etc.
4. Converts cleaned HTML to Markdown via [`node-html-markdown`](https://github.com/crosstype/node-html-markdown)
5. Returns `text/markdown` response with:
   - `x-markdown-tokens`: estimated token count (`chars / 4`)
   - `vary: accept`: tells CDNs to cache HTML and Markdown separately

## Options

```ts
interface MarkdownAgentsOptions {
  /** Header used to prevent infinite self-fetch loops. Default: 'x-markdown-skip' */
  skipHeader?: string

  /** Add `Vary: accept` to markdown responses. Default: true */
  varyHeader?: boolean

  /** Add `Content-Signal` header for AI usage permissions. Default: false */
  contentSignal?: boolean

  /** Extra HTML tag names to strip before conversion. Default: [] */
  stripSelectors?: string[]
}
```

## Testing

```bash
# Test Accept header
curl -H "Accept: text/markdown" http://localhost:3000/

# Test query param
curl "http://localhost:3000/?markdown=1"

# Check response headers
curl -sI -H "Accept: text/markdown" http://localhost:3000/ \
  | grep -E "content-type|x-markdown-tokens|vary"
```

## Requirements

- Next.js ≥ 13.0.0
- Node.js ≥ 18.0.0
- Works in **Edge Runtime** (default for Next.js middleware)

## License

MIT
