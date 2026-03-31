# @damusix/ghost-mcp

## 0.1.1

### Patch Changes

- Fix npx execution by using a .js bin wrapper instead of pointing directly to .mjs output

## 0.1.0

### Minor Changes

- Initial release of Ghost MCP server. Provides full Ghost CMS control via 3 MCP tools:

  - `use_ghost_api` — Execute any Ghost Admin or Content API action with Zod-validated payloads
  - `ghost_api_help` — Self-documenting action catalog derived from Zod schemas
  - `ghost_docs` — Search Ghost documentation via llms.txt with fuzzy and regex matching

  Supports admin mode (full CRUD on posts, pages, tags, members, newsletters, offers, tiers, webhooks, images, themes) and content mode (read-only Content API). Configurable via environment variables.
