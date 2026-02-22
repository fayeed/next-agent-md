export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">About</h1>

      <p className="text-lg text-gray-700 mb-4">
        This is an example Next.js application demonstrating <strong>next-agent-md</strong>,
        a middleware package that serves Markdown to AI agents via content negotiation.
      </p>

      <p className="text-gray-600 mb-4">
        When a client sends <code className="bg-gray-100 px-1 rounded">Accept: text/markdown</code>,
        the middleware intercepts the request, fetches the page HTML, strips navigation and boilerplate,
        converts the content to Markdown, and returns it with an <code className="bg-gray-100 px-1 rounded">x-markdown-tokens</code> header
        indicating the estimated token count.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Why Markdown?</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>~80% fewer tokens compared to raw HTML</li>
        <li>No need for custom parsing or content extraction</li>
        <li>Works with any LLM or AI agent out of the box</li>
        <li>Static pages served from pre-built files - zero conversion overhead</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">How it works</h2>
      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>Agent sends request with <code className="bg-gray-100 px-1 rounded">Accept: text/markdown</code></li>
        <li>Middleware checks for a pre-built <code className="bg-gray-100 px-1 rounded">.md</code> file (fast path)</li>
        <li>Falls back to self-fetching HTML and converting on the fly</li>
        <li>Returns <code className="bg-gray-100 px-1 rounded">text/markdown</code> with token count header</li>
      </ol>
    </main>
  )
}
