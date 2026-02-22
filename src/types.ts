// Use loose types for request/event/result so the package stays compatible
// across Next.js versions (Next.js 15, 16, etc.) without type conflicts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NextMiddleware = (request: any, event: any) => any

export interface ContentSignalOptions {
  /** Allow AI systems to use this content for training. @default true */
  aiTrain?: boolean
  /** Allow search engine indexing. @default true */
  search?: boolean
  /** Allow AI systems to use this content as input/context. @default true */
  aiInput?: boolean
}

export interface MarkdownAgentsOptions {
  /**
   * Internal header name used to prevent infinite self-fetch loops.
   * The middleware sets this header on its internal fetch and skips processing
   * if it's present on the incoming request.
   * @default 'x-markdown-skip'
   */
  skipHeader?: string

  /**
   * Whether to add a `Vary: accept` header to markdown responses.
   * This helps CDNs cache HTML and markdown versions separately.
   * @default true
   */
  varyHeader?: boolean

  /**
   * Controls the `Content-Signal` response header, which signals to AI systems
   * what they are permitted to do with this page's content.
   *
   * Set to `true` to enable all signals with their defaults, or pass an object
   * to control each signal individually.
   *
   * @example
   * contentSignal: true
   * // → Content-Signal: ai-train=yes, search=yes, ai-input=yes
   *
   * @example
   * contentSignal: { aiTrain: false, search: true, aiInput: true }
   * // → Content-Signal: ai-train=no, search=yes, ai-input=yes
   *
   * @default false (header not sent)
   */
  contentSignal?: boolean | ContentSignalOptions

  /**
   * Additional HTML tag names to strip before markdown conversion,
   * on top of the built-in list (nav, header, footer, aside, script, style, etc.)
   * @example ['cookie-banner', 'chat-widget']
   */
  stripSelectors?: string[]
}
