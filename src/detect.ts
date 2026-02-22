/**
 * Returns true if the request signals it wants a markdown response,
 * either via the Accept header (content negotiation) or a query parameter.
 */
export function wantsMarkdown(request: Request): boolean {
  const accept = request.headers.get('accept') ?? ''
  if (accept.includes('text/markdown')) return true

  const url = new URL(request.url)
  if (url.searchParams.get('markdown') === '1') return true

  return false
}
