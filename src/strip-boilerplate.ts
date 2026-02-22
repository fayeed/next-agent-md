/**
 * HTML tags whose content is typically boilerplate (navigation, chrome, scripts).
 * These are stripped before markdown conversion to reduce noise for AI agents.
 */
const DEFAULT_STRIP_TAGS = [
  'nav',
  'header',
  'footer',
  'aside',
  'script',
  'style',
  'noscript',
  'iframe',
  'svg',
]

/**
 * ARIA roles that indicate navigation or structural boilerplate (not content).
 */
const STRIP_ROLES = ['navigation', 'banner', 'contentinfo', 'complementary']

/**
 * Strips boilerplate HTML elements from a page before markdown conversion.
 *
 * Uses regex rather than a DOM parser to remain compatible with the Edge Runtime
 * (jsdom and similar are not available). Handles the common case well; deeply
 * nested elements of the same tag type may not be fully removed.
 *
 * @param html - Raw HTML string to clean
 * @param extraTags - Additional tag names to strip (e.g. ['cookie-banner'])
 */
export function stripBoilerplate(html: string, extraTags: string[] = []): string {
  let result = html

  const allTags = [...DEFAULT_STRIP_TAGS, ...extraTags]

  for (const tag of allTags) {
    // Match the full element including content, non-greedy to avoid over-matching
    const tagRegex = new RegExp(`<${tag}[\\s>][\\s\\S]*?<\\/${tag}>`, 'gi')
    result = result.replace(tagRegex, '')

    // Also handle self-closing variants: <tag ... />
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/>`, 'gi')
    result = result.replace(selfClosingRegex, '')
  }

  // Remove elements with ARIA roles indicating structural boilerplate
  for (const role of STRIP_ROLES) {
    const roleRegex = new RegExp(
      `<[a-z][^>]+role=["']${role}["'][\\s\\S]*?>[\\s\\S]*?<\\/[a-z]+>`,
      'gi'
    )
    result = result.replace(roleRegex, '')
  }

  // Remove HTML comments, often contain CMS/build tool artifacts
  result = result.replace(/<!--[\s\S]*?-->/g, '')

  return result
}
