import { NodeHtmlMarkdown } from 'node-html-markdown'

/**
 * Shared converter instance — reusing avoids repeated option parsing overhead.
 */
const nhm = new NodeHtmlMarkdown({
  // Use fenced code blocks (```) for better AI readability
  codeBlockStyle: 'fenced',
  // Limit consecutive blank lines — saves tokens
  maxConsecutiveNewlines: 2,
  // Skip data: URIs — they're noise for AI agents
  keepDataImages: false,
  // Inline links are cleaner for AI consumption
  useInlineLinks: true,
})

/**
 * Converts an HTML string to Markdown.
 */
export function htmlToMarkdown(html: string): string {
  return nhm.translate(html)
}
