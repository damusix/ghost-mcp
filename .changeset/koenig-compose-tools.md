---
'@damusix/ghost-mcp': minor
---

Add Koenig content-block composition so LLMs build clean, natively-editable posts instead of raw HTML.

New tools: `compose_post` (create/update a post from structured blocks), `compose_lexical` (compile blocks to a Lexical string), and `koenig_help` (discover block types and fields). A `compose_ghost_post` MCP prompt steers clients toward blocks over raw HTML. Prose blocks (paragraph/heading/list/quote/aside) become native Lexical nodes with inline markdown support; rich features use cards (callout, image, button, bookmark, codeblock, toggle, gallery, and more) with friendly field aliases.
