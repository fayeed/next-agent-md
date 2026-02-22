import { notFound } from 'next/navigation'

const posts: Record<string, { title: string; date: string; content: string }> = {
  'hello-world': {
    title: 'Hello, World',
    date: 'February 22, 2026',
    content: `
This is a sample blog post to demonstrate how **next-agent-md** serves content to AI agents.

When you request this page with \`Accept: text/markdown\`, the middleware returns clean Markdown
instead of HTML - stripping away navigation, scripts, and boilerplate so agents only receive
the content that matters.

## What gets stripped

The middleware removes the following before converting to Markdown:

- \`<nav>\` - site navigation
- \`<header>\` - page headers
- \`<footer>\` - footers
- \`<aside>\` - sidebars
- \`<script>\` and \`<style>\` tags
- HTML comments

## What you get

A clean Markdown document with:

- Proper headings (\`#\`, \`##\`, etc.)
- Formatted lists
- Fenced code blocks
- Inline links preserved
- An \`x-markdown-tokens\` header with the estimated token count
    `,
  },
  'getting-started': {
    title: 'Getting Started with next-agent-md',
    date: 'February 22, 2026',
    content: `
## Installation

\`\`\`bash
npm install next-agent-md
\`\`\`

## Quick start

Run the init command to scaffold your middleware:

\`\`\`bash
npx next-agent-md init
\`\`\`

This creates a \`middleware.ts\` at your project root:

\`\`\`ts
import { withMarkdownForAgents } from 'next-agent-md'

export default withMarkdownForAgents()

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
\`\`\`

## Pre-building static pages

Add the config plugin to get automatic Markdown pre-generation after \`next build\`:

\`\`\`ts
// next.config.ts
import { withAgentMd } from 'next-agent-md/config'

export default withAgentMd()(nextConfig)
\`\`\`

Pre-built pages are served instantly from \`public/.well-known/markdown/\` -
no self-fetch or conversion at request time.
    `,
  },
}

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }))
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = posts[slug]

  if (!post) notFound()

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <a href="/" className="text-sm text-gray-500 hover:underline mb-8 inline-block">← Home</a>
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-400 mb-10">{post.date}</p>
      <article className="prose prose-gray max-w-none">
        {post.content.trim().split('\n').map((line, i) => (
          <p key={i} className="mb-2 text-gray-700">{line}</p>
        ))}
      </article>
    </main>
  )
}
