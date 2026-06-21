# client-tools

## What it does

Provides six exported MCP tool handlers backed by three `FetchEngine` instances (`adminApi`, `contentApi`, `docsApi`) in [`src/ghost-client.ts`](../../../src/ghost-client.ts). Three original tools (`use_ghost_api`, `ghost_api_help`, `ghost_docs`) handle direct API dispatch, action help, and docs search. Three new tools (`compose_post`, `compose_lexical`, `koenig_help`) expose the [`src/koenig/`](../../../src/koenig) composition layer that turns structured block arrays into Ghost-native Lexical JSON. The MCP server also registers one prompt (`compose_ghost_post`). Admin authentication uses short-lived HS256 JWTs regenerated on every request via a `beforeRequest` hook.

## CLI code

- [`src/ghost-client.ts`](../../../src/ghost-client.ts) — constructs and exports `adminApi`, `contentApi`, and `docsApi` `FetchEngine` instances; also configures the global `@logosdx/fetch` instance for raw file downloads (no auth, no cache)
- [`src/types.ts`](../../../src/types.ts) — TypeScript interfaces for all Ghost resource shapes: `GhostPost`, `GhostPage`, `GhostTag`, `GhostAuthor`, `GhostMember`, `GhostNewsletter`, `GhostOffer`, `GhostTier`, `GhostUser`, `GhostWebhook`, `GhostTheme`, `GhostImage`, `GhostPaginationMeta`
- [`src/tools/use-ghost-api.ts`](../../../src/tools/use-ghost-api.ts) — `handleUseGhostApi(input, mode)`: dispatches actions from the registry, builds paths with `{id}`/`{slug}`/`{name}` substitution, routes to GET/POST/PUT/DELETE branches, wraps mutation bodies as `{ [resourceKey]: [body] }`, handles `images.upload` and `themes.upload` via multipart FormData
- [`src/tools/ghost-api-help.ts`](../../../src/tools/ghost-api-help.ts) — `handleGhostApiHelp(input)`: returns markdown listing all actions grouped by API and resource, or detailed schema info for a single action
- [`src/tools/ghost-docs.ts`](../../../src/tools/ghost-docs.ts) — `handleGhostDocs(input)`: fetches `/llms.txt` from `https://docs.ghost.org` via `docsApi`; supports returning full content, substring search, or regex matching with ±1 line context
- [`src/tools/compose-post.ts`](../../../src/tools/compose-post.ts) — `handleComposePost(input, mode)`: calls `compose(blocks)` from the koenig module to produce a Lexical JSON string, then dispatches `posts.add` or `posts.edit` via `handleUseGhostApi`; `excerpt` is remapped to `custom_excerpt` before dispatch; `ComposeError` issues are returned as JSON, not thrown
- [`src/tools/compose-lexical.ts`](../../../src/tools/compose-lexical.ts) — `handleComposeLexical(input)`: calls `compose(blocks)` and returns `{ lexical }` JSON without creating a post; used for preview/inspection
- [`src/tools/koenig-help.ts`](../../../src/tools/koenig-help.ts) — `handleKoenigHelp(input)`: delegates to `blockHelp(blockType?)` from [`src/koenig/help.ts`](../../../src/koenig/help.ts); returns a catalog of all block types or field details + JSON example for a named block
- [`src/koenig/index.ts`](../../../src/koenig/index.ts) — barrel: re-exports `compose`, `composeRoot`, `ComposeError`, `ComposeIssue`, `buildBlock`, `Block`, `PROSE_TYPES`, `CARDS`, `isCardType`, `parseInline`, `FORMAT`, `blockHelp`, `listBlockTypes`, `NODE_SPECS`
- [`src/koenig/blocks.ts`](../../../src/koenig/blocks.ts) — `buildBlock(block)`: routes a `Block` to `buildProse` (paragraph, heading, list, quote, aside → native Lexical element nodes) or `buildCardNode`; prose types produce `extended-text`/`link` children via `parseInline`; unknown types throw with the full valid-type list
- [`src/koenig/inline.ts`](../../../src/koenig/inline.ts) — `parseInline(text)`: tokenizes a subset of inline markdown (`**bold**`, `*italic*`, `_italic_`, [``](../../..) `code` [``](../../..), `[label](url)`) into Lexical `extended-text` and `link` nodes using a single regex pass; format is a bitmask (bold=1, italic=2, strikethrough=4, underline=8, code=16)
- [`src/koenig/cards.ts`](../../../src/koenig/cards.ts) — `CARDS` registry mapping card type strings to `{ nodeType, version, description, group, required, aliases, example }` descriptors; `buildCardNode(type, fields)` applies field aliases then writes a `{ type: 'card', cardType, payload }` node; `isCardType(type)` guards the dispatch in `buildBlock`
- [`src/koenig/compose.ts`](../../../src/koenig/compose.ts) — `compose(blocks)`: top-level entry point; calls `buildBlock` per block, aggregates per-block errors into `ComposeError` with index/type/message tuples so the LLM gets actionable feedback; `composeRoot` returns the structured `LexicalNode`; `compose` returns `JSON.stringify(composeRoot(blocks))`
- [`src/koenig/help.ts`](../../../src/koenig/help.ts) — `blockHelp(blockType?)`: returns markdown catalog of all prose types (from static `PROSE` array) and all card types (from `CARDS`), grouped; or detailed description, required fields, aliases, and a JSON example for a named block; `listBlockTypes()` returns a flat string array
- [`src/koenig/node-specs.ts`](../../../src/koenig/node-specs.ts) — `NODE_SPECS`: generated constant array of Lexical node schema objects derived from [`docs/koenig-node-specs.json`](../../../docs/koenig-node-specs.json); consumed by `blockHelp` for extended type info

## Docs

- [`docs/koenig-cards.md`](../../../docs/koenig-cards.md) — reference for all Koenig card types and their fields; used as source material for [`src/koenig/cards.ts`](../../../src/koenig/cards.ts)
- [`docs/koenig-cards.json`](../../../docs/koenig-cards.json) — machine-readable card catalog (358 lines); source for [`scripts/koenig/`](../../../scripts/koenig) extraction scripts
- [`docs/koenig-node-specs.json`](../../../docs/koenig-node-specs.json) — Lexical node schema specs (311 lines); source for [`src/koenig/node-specs.ts`](../../../src/koenig/node-specs.ts)
- [`docs/experimentation.md`](../../../docs/experimentation.md) — notes on local Ghost stack used to validate Koenig composition output

## Coupling

- [`src/tools/compose-post.ts`](../../../src/tools/compose-post.ts) imports `handleUseGhostApi` from [`src/tools/use-ghost-api.ts`](../../../src/tools/use-ghost-api.ts) — compose-post is a thin wrapper over the existing action dispatch; changes to `handleUseGhostApi` signature break compose-post
- [`src/tools/compose-post.ts`](../../../src/tools/compose-post.ts) and [`src/tools/compose-lexical.ts`](../../../src/tools/compose-lexical.ts) import `compose` and `ComposeError` from [`src/koenig/index.ts`](../../../src/koenig/index.ts) — changes to the `Block` interface or `compose` function signature propagate to both tools
- [`src/tools/use-ghost-api.ts`](../../../src/tools/use-ghost-api.ts) imports `getAction` and `ApiType` from [`src/actions/registry.ts`](../../../src/actions/registry.ts) — changes to action definitions or `ApiType` values require updates here
- [`src/tools/ghost-api-help.ts`](../../../src/tools/ghost-api-help.ts) imports `listActions` and `getActionHelp` from [`src/actions/registry.ts`](../../../src/actions/registry.ts) — registry changes propagate to MCP tool output
- [`src/koenig/blocks.ts`](../../../src/koenig/blocks.ts) imports `buildCardNode`, `isCardType`, `CARDS` from [`src/koenig/cards.ts`](../../../src/koenig/cards.ts) — adding or removing card types requires updating `cards.ts` only; `blocks.ts` and `help.ts` derive their type lists from the same registry
- [`src/types.ts`](../../../src/types.ts) is not imported by any file in this domain; available for other domains that need Ghost resource shapes

## Conventions worth knowing

- All six handlers return `string` (JSON-serialised or plain text) — never throw; errors are serialised as `{ error: string }` or `{ error: string, issues: ComposeIssue[] }` JSON
- `handleUseGhostApi` receives a `mode` string argument (`'admin'` or `'content'`) separate from the `api` field in the input schema; `mode === 'content'` gates out admin API calls at the handler level
- `compose_post` uses `id` + `updated_at` for update (collision detection); omitting `id` creates a new post; `posts.edit` and `posts.add` are the actions dispatched
- Prose blocks (paragraph, heading, list, quote, aside) produce native editable Lexical element nodes; all other types are card nodes (`{ type: 'card', cardType, payload }`)
- Inline markdown in prose `text` is tokenized by a single regex pass in `parseInline`; unsupported syntax is preserved as plain text
- `CARDS` in [`src/koenig/cards.ts`](../../../src/koenig/cards.ts) is the single registry for card types — `blockHelp`, `buildBlock`, and `isCardType` all derive from it; adding a new card type requires only a new entry in `CARDS`
- `docsApi` is configured with `defaultType: 'text'` (unlike `adminApi`/`contentApi` which use `'json'`), so `response.data` is a raw string
- All environment variables (`GHOST_URL`, `GHOST_ADMIN_API_KEY`, `GHOST_CONTENT_API_KEY`, `GHOST_API_VERSION`, `GHOST_RATE_LIMIT`) are read at module load time with no runtime re-read
- [`vite.config.ts`](../../../vite.config.ts) `test` block scopes vitest discovery to `src/**` — test files outside that path (e.g. under `tmp/`) are not discovered
- 94 koenig tests pass under [`src/__tests__/koenig/`](../../../src/__tests__/koenig) (compose.test.ts, inline.test.ts) and [`src/__tests__/tools/compose-post.test.ts`](../../../src/__tests__/tools/compose-post.test.ts)
