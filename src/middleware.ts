import { NextResponse } from 'next/server'
import type { NextRequest, NextFetchEvent } from 'next/server'
import type { MarkdownAgentsOptions, NextMiddleware } from './types'
import { wantsMarkdown } from './detect'
import { fetchPageHtml } from './fetch-html'
import { stripBoilerplate } from './strip-boilerplate'
import { htmlToMarkdown } from './convert'
import { estimateTokens } from './tokens'

const DEFAULT_SKIP_HEADER = 'x-markdown-skip'

function buildContentSignalHeader(
  option: MarkdownAgentsOptions['contentSignal']
): string | null {
  if (!option) return null
  const signals = typeof option === 'object' ? option : {}
  const aiTrain = (signals.aiTrain ?? true) ? 'yes' : 'no'
  const search = (signals.search ?? true) ? 'yes' : 'no'
  const aiInput = (signals.aiInput ?? true) ? 'yes' : 'no'
  return `ai-train=${aiTrain}, search=${search}, ai-input=${aiInput}`
}

/**
 * Higher-order function that wraps a Next.js middleware (or runs standalone)
 * to serve Markdown responses to AI agents.
 *
 * When a request includes `Accept: text/markdown` or `?markdown=1`, the middleware:
 * 1. Self-fetches the page to get its HTML
 * 2. Strips navigation/boilerplate elements
 * 3. Converts HTML to Markdown
 * 4. Returns the Markdown with an `x-markdown-tokens` token estimate header
 *
 * @example
 * // middleware.ts — zero config
 * import { withMarkdownForAgents } from 'next-agent-md'
 * export default withMarkdownForAgents()
 *
 * @example
 * // middleware.ts — wrapping existing middleware
 * import { withMarkdownForAgents } from 'next-agent-md'
 * import { myAuthMiddleware } from './lib/auth'
 * export default withMarkdownForAgents(myAuthMiddleware, { varyHeader: true })
 */
export function withMarkdownForAgents(
  middleware?: NextMiddleware,
  options: MarkdownAgentsOptions = {}
): NextMiddleware {
  const {
    skipHeader = DEFAULT_SKIP_HEADER,
    varyHeader = true,
    contentSignal = false,
    stripSelectors = [],
  } = options

  return async (request: NextRequest, event: NextFetchEvent) => {
    // ── LOOP PREVENTION ──────────────────────────────────────────────────────
    // If this is our own internal self-fetch, pass straight through.
    if (request.headers.get(skipHeader) === '1') {
      return middleware ? middleware(request, event) : NextResponse.next()
    }

    // ── MARKDOWN DETECTION ───────────────────────────────────────────────────
    if (!wantsMarkdown(request)) {
      return middleware ? middleware(request, event) : NextResponse.next()
    }

    // ── SELF-FETCH THE HTML ──────────────────────────────────────────────────
    const html = await fetchPageHtml(request, skipHeader)

    if (!html) {
      // Graceful fallback: self-fetch failed (e.g. 404, auth-gated, non-HTML)
      return middleware ? middleware(request, event) : NextResponse.next()
    }

    // ── STRIP BOILERPLATE ────────────────────────────────────────────────────
    const cleanedHtml = stripBoilerplate(html, stripSelectors)

    // ── CONVERT TO MARKDOWN ──────────────────────────────────────────────────
    const markdown = htmlToMarkdown(cleanedHtml)

    // ── BUILD RESPONSE ───────────────────────────────────────────────────────
    const responseHeaders = new Headers({
      'content-type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(estimateTokens(markdown)),
    })

    if (varyHeader) {
      responseHeaders.set('vary', 'accept')
    }

    const contentSignalValue = buildContentSignalHeader(contentSignal)
    if (contentSignalValue) {
      responseHeaders.set('content-signal', contentSignalValue)
    }

    return new Response(markdown, {
      status: 200,
      headers: responseHeaders,
    })
  }
}
