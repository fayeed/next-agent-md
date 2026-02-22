/**
 * Returns true if the request signals it wants a markdown response
 * via the Accept header (content negotiation).
 */
export function wantsMarkdown(request: Request): boolean {
  const accept = request.headers.get('accept') ?? ''
  return accept.includes('text/markdown')
}
