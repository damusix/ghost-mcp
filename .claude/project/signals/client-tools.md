# client-tools

## What it does

Provides three exported MCP tool handlers — `handleUseGhostApi`, `handleGhostApiHelp`, and `handleGhostDocs` — backed by three `FetchEngine` instances (`adminApi`, `contentApi`, `docsApi`) constructed in [`src/ghost-client.ts`](../../../src/ghost-client.ts). All API calls go through `@logosdx/fetch`'s `FetchEngine` with shared resilience config (3 retries, exponential backoff, 1-hour GET cache, per-window rate limiting, request deduplication). Admin authentication uses short-lived HS256 JWTs regenerated on every request via a `beforeRequest` hook.

## CLI code

- [`src/ghost-client.ts`](../../../src/ghost-client.ts) — constructs and exports `adminApi`, `contentApi`, and `docsApi` `FetchEngine` instances; also configures the global `@logosdx/fetch` instance for raw file downloads (no auth, no cache)
- [`src/types.ts`](../../../src/types.ts) — TypeScript interfaces for all Ghost resource shapes: `GhostPost`, `GhostPage`, `GhostTag`, `GhostAuthor`, `GhostMember`, `GhostNewsletter`, `GhostOffer`, `GhostTier`, `GhostUser`, `GhostWebhook`, `GhostTheme`, `GhostImage`, `GhostPaginationMeta`
- [`src/tools/use-ghost-api.ts`](../../../src/tools/use-ghost-api.ts) — `handleUseGhostApi(input, mode)`: dispatches actions from the registry, builds paths with `{id}`/`{slug}`/`{name}` substitution, routes to GET/POST/PUT/DELETE branches, wraps mutation bodies as `{ [resourceKey]: [body] }`, handles `images.upload` and `themes.upload` via multipart FormData (URL download or base64 decode)
- [`src/tools/ghost-api-help.ts`](../../../src/tools/ghost-api-help.ts) — `handleGhostApiHelp(input)`: returns markdown listing all actions grouped by API and resource, or detailed schema info for a single action, by delegating to `listActions`/`getActionHelp` from the registry
- [`src/tools/ghost-docs.ts`](../../../src/tools/ghost-docs.ts) — `handleGhostDocs(input)`: fetches `/llms.txt` from `https://docs.ghost.org` via `docsApi`; supports returning full content, case-insensitive substring search with ±1 line context, or regex matching with ±1 line context
- [`src/__tests__/ghost-client.test.ts`](../../../src/__tests__/ghost-client.test.ts) — unit tests for `adminApi`/`contentApi` construction (baseUrl, headers, params) and JWT signing via mocked `@logosdx/fetch` and `jsonwebtoken`
- [`src/__tests__/tools/use-ghost-api.test.ts`](../../../src/__tests__/tools/use-ghost-api.test.ts) — unit tests for `handleUseGhostApi`: mode gating, unknown action, Zod validation, query param building, path substitution, body wrapping, DELETE execution, content vs admin engine selection (the DELETE test asserts `adminApi.delete` was called but does not assert `invalidatePath`)
- [`src/__tests__/tools/ghost-api-help.test.ts`](../../../src/__tests__/tools/ghost-api-help.test.ts) — unit tests for `handleGhostApiHelp`: grouped listing, API filtering, per-action schema detail (parameters, required fields, enum values, nested objects, arrays, union types, example payload)
- [`src/__tests__/tools/ghost-docs.test.ts`](../../../src/__tests__/tools/ghost-docs.test.ts) — unit tests for `handleGhostDocs`: full content, substring search, regex (with and without `/pattern/flags` delimiter syntax), no-match message, fetch error handling

## Docs

None.

## Coupling

- [`src/tools/use-ghost-api.ts`](../../../src/tools/use-ghost-api.ts) imports `adminApi` and `contentApi` from [`src/ghost-client.ts`](../../../src/ghost-client.ts) — changes to the `FetchEngine` exports or their method signatures break this tool directly
- [`src/tools/use-ghost-api.ts`](../../../src/tools/use-ghost-api.ts) imports `getAction` and the `ApiType` type from [`src/actions/registry.ts`](../../../src/actions/registry.ts) — changes to action definitions, the registry API, or `ApiType` values require updates here
- [`src/tools/ghost-api-help.ts`](../../../src/tools/ghost-api-help.ts) imports `listActions` and `getActionHelp` from [`src/actions/registry.ts`](../../../src/actions/registry.ts) — the rendered help output reflects registry content exactly; registry changes propagate to MCP tool output
- [`src/tools/ghost-docs.ts`](../../../src/tools/ghost-docs.ts) imports `docsApi` from [`src/ghost-client.ts`](../../../src/ghost-client.ts) — changes to `docsApi` construction affect docs fetching
- [`src/types.ts`](../../../src/types.ts) is not imported by any file in this domain; it is available for other domains that need Ghost resource shapes

## Conventions worth knowing

- All three handlers return `string` (JSON-serialised or plain text) — never throw; errors are serialised as `{ error: string }` JSON
- `handleUseGhostApi` receives a `mode` string argument (`'admin'` or `'content'`) separate from the `api` field in the input schema; `mode === 'content'` gates out admin API calls at the handler level
- Path parameters are limited to the three constants `['id', 'slug', 'name']` defined in `PATH_PARAMS`; only these three are ever substituted into action path templates
- POST and PUT bodies are always wrapped as `{ [resourceKey]: [body] }` where `resourceKey` is the first segment of the dot-notation action name (e.g. `posts.edit` → `posts`)
- Cache invalidation after DELETE and PUT uses `engine.invalidatePath('/' + resourceKey)` — the prefix is derived from the action name the same way as the body wrapper
- File upload for `images.upload` and `themes.upload` bypasses the `FetchEngine` auth/cache pipeline for the download step by using the global `@logosdx/fetch` `get` function directly; the upload POST still goes through `adminApi`
- MIME type resolution for uploads is built at module load time by iterating `mime-db` entries into `extToMime`; unknown extensions fall back to `application/octet-stream`
- `docsApi` is configured with `defaultType: 'text'` (unlike `adminApi`/`contentApi` which use `'json'`), so `response.data` is a raw string
- The admin JWT is regenerated on every request via a `beforeRequest` hook (line 71–73 of [`src/ghost-client.ts`](../../../src/ghost-client.ts)); the token created at construction time is replaced immediately on the first real request
- All environment variables (`GHOST_URL`, `GHOST_ADMIN_API_KEY`, `GHOST_CONTENT_API_KEY`, `GHOST_API_VERSION`, `GHOST_RATE_LIMIT`) are read at module load time with no runtime re-read
