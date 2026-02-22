[← Home](/)

# Hello, World

February 22, 2026

This is a sample blog post to demonstrate how \*\*next-agent-md\*\* serves content to AI agents.

When you request this page with \`Accept: text/markdown\`, the middleware returns clean Markdown

instead of HTML, stripping away navigation, scripts, and boilerplate so agents only receive

the content that matters.

\## What gets stripped

The middleware removes the following before converting to Markdown:

\- \`<nav>\` - site navigation

\- \`<header>\` - page headers

\- \`<footer>\` - footers

\- \`<aside>\` - sidebars

\- \`<script>\` and \`<style>\` tags

\- HTML comments

\## What you get

A clean Markdown document with:

\- Proper headings (\`#\`, \`##\`, etc.)

\- Formatted lists

\- Fenced code blocks

\- Inline links preserved

\- An \`x-markdown-tokens\` header with the estimated token count