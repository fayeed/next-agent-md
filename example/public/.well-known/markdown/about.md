# About

This is an example Next.js application demonstrating **next-agent-md**, a middleware package that serves Markdown to AI agents via content negotiation.

When a client sends `Accept: text/markdown`, the middleware intercepts the request, fetches the page HTML, strips navigation and boilerplate, converts the content to Markdown, and returns it with an `x-markdown-tokens` header indicating the estimated token count.

## Why Markdown?

* \~80% fewer tokens compared to raw HTML
* No need for custom parsing or content extraction
* Works with any LLM or AI agent out of the box
* Static pages served from pre-built files - zero conversion overhead

## How it works

1. Agent sends request with `Accept: text/markdown`
2. Middleware checks for a pre-built `.md` file (fast path)
3. Falls back to self-fetching HTML and converting on the fly
4. Returns `text/markdown` with token count header