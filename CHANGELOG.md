# @damusix/ghost-mcp

## 0.5.0

### Minor Changes

- [#17](https://github.com/damusix/ghost-mcp/pull/17) [`1a60534`](https://github.com/damusix/ghost-mcp/commit/1a605343a054093a39be7c7c862b7d6a794fe8cc) Thanks [@damusix](https://github.com/damusix)! - Bundle a `ghost-writing` Agent Skill with the package.

  The npm package now ships `skills/ghost-writing/` — an Agent Skill that pairs with the MCP server and teaches a client how to write Ghost posts well: which tool to use when (`compose_post` vs `use_ghost_api`, `blockFile` iteration for long posts), the full Koenig block catalog with guidance on choosing between similar blocks, and best practices for post structure, metadata, publishing, newsletters, and members-only content. Install it with `npx skills add damusix/ghost-mcp`.

## 0.4.1

### Patch Changes

- [`d609f9f`](https://github.com/damusix/ghost-mcp/commit/d609f9f4c99458e880c7ce3d023cab5d32a33df7) Thanks [@damusix](https://github.com/damusix)! - Read the MCP server version from package metadata instead of a hardcoded string, so clients see the actual installed version.

- [`d609f9f`](https://github.com/damusix/ghost-mcp/commit/d609f9f4c99458e880c7ce3d023cab5d32a33df7) Thanks [@damusix](https://github.com/damusix)! - Surface Ghost API error details and return clean response bodies from `use_ghost_api`:

  - Failed requests now return the Ghost error body (`status` plus `errors[]` with `message`, `context`, `type`, and `property`) instead of only the HTTP status text, so validation failures explain what actually went wrong.
  - Successful responses now return the Ghost body directly instead of the HTTP transport wrapper — pagination metadata (`meta.pagination`) is visible at the top level, and internal request config (including the admin `Authorization` header) no longer appears in tool output.
  - `posts.add`/`posts.edit` and `pages.add`/`pages.edit` accept tags as plain name strings in addition to `{ id }` / `{ name }` objects.
  - `offers.browse` accepts a `filter` parameter (e.g. `status:active`).

## 0.4.0

### Minor Changes

- [`e879710`](https://github.com/damusix/ghost-mcp/commit/e879710faa08e7d61f0696c57050040e36f8a3ce) Thanks [@damusix](https://github.com/damusix)! - Support composing posts from a JSON file on disk via `blockFile`.

  `compose_post` and `compose_lexical` now accept either inline `blocks` or a `blockFile` — an absolute path to a local JSON file containing a bare `[...]` array or `{ "blocks": [...] }`. This lets a client draft long posts in its own working file (validating with `compose_lexical` as it edits) and pass just the path, instead of re-sending the whole block array on every change. Exactly one of `blocks` or `blockFile` is required.

- [`35e27b6`](https://github.com/damusix/ghost-mcp/commit/35e27b66a9d856ca7a86a274e594e4926ac71486) Thanks [@damusix](https://github.com/damusix)! - Add Koenig content-block composition so LLMs build clean, natively-editable posts instead of raw HTML.

  New tools: `compose_post` (create/update a post from structured blocks), `compose_lexical` (compile blocks to a Lexical string), and `koenig_help` (discover block types and fields). A `compose_ghost_post` MCP prompt steers clients toward blocks over raw HTML. Prose blocks (paragraph/heading/list/quote/aside) become native Lexical nodes with inline markdown support; rich features use cards (callout, image, button, bookmark, codeblock, toggle, gallery, and more) with friendly field aliases.

### Patch Changes

- [`27f2a5c`](https://github.com/damusix/ghost-mcp/commit/27f2a5c10a29ad4ab4147f6c114f322df5bc7077) Thanks [@damusix](https://github.com/damusix)! - ghost_docs no longer swallows fetch failures.

  Removed the redundant `attempt` tuple + try/catch + error re-wrapping in the `ghost_docs` tool. A failed docs fetch now rejects and propagates (surfaced as a tool error) instead of being caught and returned as an `"Error: ..."` string. This matches the codebase's error-handling conventions and drops the `!`/`as` it relied on.

## 0.3.0

### Minor Changes

- [`3974029`](https://github.com/damusix/ghost-mcp/commit/3974029a712ea78aebe7971cf266429cfdf28a4e) - Add missing fields to admin API schemas (newsletter design fields, post slug/email_only/email_segment, page slug, tier trial_days, offer redemption_type) and remove invalid fields (offers.edit non-editable fields, members expertise). Enhance ghost_api_help to display enum values, nested object structure, array item types, and union variants.

## 0.2.1

### Patch Changes

- [`3a26571`](https://github.com/damusix/ghost-mcp/commit/3a2657149e63fa16f569cc307650b3a8335c2d38) - Fix image/theme uploads returning 422 by setting proper MIME types via mime-db and using per-request `onBeforeReq` to remove Content-Type header so the multipart boundary is auto-generated.

## 0.2.0

### Minor Changes

- [`3f99ac6`](https://github.com/damusix/ghost-mcp/commit/3f99ac604fc25f083ae86018c673a8e25e540442) - Add resilience to all FetchEngine clients: retry with exponential backoff, 60-min response cache with stale-while-revalidate, request deduplication, rate limiting (configurable via `GHOST_RATE_LIMIT` env var), and request timeouts. Replace manual docs cache with dedicated FetchEngine instance. Use unauthenticated global fetch for file downloads in image/theme uploads.

## 0.1.3

### Patch Changes

- [`1cb5328`](https://github.com/damusix/ghost-mcp/commit/1cb5328e05150fda2f9ff5bfc0d8a9fe6f59c85e) - Fix all write operations (posts.add, tags.add, posts.edit, etc.) returning 422 Unprocessable Entity. Added missing Content-Type header and fixed path param stripping that was removing required body fields like `name` from tag payloads.

## 0.1.2

### Patch Changes

- [`b38f490`](https://github.com/damusix/ghost-mcp/commit/b38f490d3f67c37bd0a030d09ef85ba4f81163f5) - Fix admin API authentication — all authenticated endpoints were returning 403 Forbidden because the JWT Authorization header was never being sent. Now uses hooks.add('beforeRequest') to set a fresh JWT on every request.

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
