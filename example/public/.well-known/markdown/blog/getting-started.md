[← Home](/)

# Getting Started with next-agent-md

February 22, 2026

\## Installation

\`\`\`bash

npm install next-agent-md

\`\`\`

\## Quick start

Run the init command to scaffold your middleware:

\`\`\`bash

npx next-agent-md init

\`\`\`

This creates a \`middleware.ts\` at your project root:

\`\`\`ts

import { withMarkdownForAgents } from 'next-agent-md'

export default withMarkdownForAgents()

export const config = {

 matcher: \['/((?!\_next/static|\_next/image|favicon.ico).\*)'\],

}

\`\`\`

\## Pre-building static pages

Add the config plugin to get automatic Markdown pre-generation after \`next build\`:

\`\`\`ts

// next.config.ts

import { withAgentMd } from 'next-agent-md/config'

export default withAgentMd()(nextConfig)

\`\`\`

Pre-built pages are served instantly from \`public/.well-known/markdown/\` -

no self-fetch or conversion at request time.