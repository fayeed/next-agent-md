export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">next-agent-md example</h1>
      <p className="text-lg text-gray-600 mb-8">
        This site demonstrates the <code className="bg-gray-100 px-1 rounded">next-agent-md</code> middleware.
        AI agents requesting any page with <code className="bg-gray-100 px-1 rounded">Accept: text/markdown</code> will
        receive clean Markdown instead of HTML — reducing token usage by ~80%.
      </p>

      <nav className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Pages to try</h2>
        <ul className="space-y-2 list-disc list-inside text-gray-700">
          <li><a href="/about" className="text-blue-600 hover:underline">/about</a> — static page</li>
          <li><a href="/blog/hello-world" className="text-blue-600 hover:underline">/blog/hello-world</a> — static blog post</li>
          <li><a href="/blog/getting-started" className="text-blue-600 hover:underline">/blog/getting-started</a> — static blog post</li>
        </ul>
      </nav>

      <section className="bg-gray-50 rounded-lg p-6 font-mono text-sm">
        <p className="font-semibold mb-3 font-sans">Test with curl:</p>
        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">{[
          'curl -H "Accept: text/markdown" http://localhost:3000/',
          'curl -H "Accept: text/markdown" http://localhost:3000/about',
          'curl -H "Accept: text/markdown" http://localhost:3000/blog/hello-world',
        ].join('\n')}</pre>
      </section>
    </main>
  )
}
