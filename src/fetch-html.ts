/**
 * Performs an internal self-fetch to retrieve the HTML version of the current page.
 *
 * Loop prevention: sets the skip header on the outgoing request so the middleware
 * recognises the fetch as internal and skips markdown processing.
 *
 * @param request - The original incoming request
 * @param skipHeader - The header name used to signal an internal fetch
 * @returns The HTML body string, or null if the fetch failed or returned non-HTML
 */
export async function fetchPageHtml(
  request: Request,
  skipHeader: string
): Promise<string | null> {
  const targetUrl = new URL(request.url)
  const forwardHeaders = new Headers()

  // Forward session/auth cookies so protected pages render correctly
  const cookie = request.headers.get('cookie')
  if (cookie) forwardHeaders.set('cookie', cookie)

  // Forward Accept-Language for i18n pages
  const lang = request.headers.get('accept-language')
  if (lang) forwardHeaders.set('accept-language', lang)

  // Loop prevention: this header tells the middleware to skip processing
  forwardHeaders.set(skipHeader, '1')

  // Explicitly request HTML to override any Accept: text/markdown from the caller
  forwardHeaders.set('accept', 'text/html')

  let response: Response
  try {
    response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: forwardHeaders,
      cache: 'no-store',
    })
  } catch {
    return null
  }

  if (!response.ok) return null

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('text/html')) return null

  return response.text()
}
