import { withMarkdownForAgents } from 'next-agent-md'

export default withMarkdownForAgents({
  contentSignal: true,
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
