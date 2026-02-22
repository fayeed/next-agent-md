# next-agent-md example

This site demonstrates the `next-agent-md` middleware. AI agents requesting any page with `Accept: text/markdown` will receive clean Markdown instead of HTML — reducing token usage by \~80%.

Test with curl:

curl -H "Accept: text/markdown" http://localhost:3000/
curl -H "Accept: text/markdown" http://localhost:3000/about
curl -H "Accept: text/markdown" http://localhost:3000/blog/hello-world