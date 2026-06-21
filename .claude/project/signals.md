# Project signals

## Framework & runtime

TypeScript ESM package (`"type": "module"`), Node.js, built with `vite-plus` (`vp`). Package manager pinned to `pnpm@10.33.0` via `packageManager` field; `pnpm.onlyBuiltDependencies: ["esbuild"]` approves esbuild's postinstall script (required since pnpm 11 blocks unapproved build scripts by default). MCP server over stdio transport using `@modelcontextprotocol/sdk`. HTTP via `@logosdx/fetch` `FetchEngine` with built-in retry/cache/rate-limit/dedupe. Zod for all schema validation. JWT (`jsonwebtoken`, HS256) for Ghost Admin API auth. Published as `@damusix/ghost-mcp` v0.3.0.

## Build / test / lint

| Purpose | Command | Source |
|---------|---------|--------|
| Build (ESM + `.d.mts`) | `pnpm build` → `vp pack` | [`vite.config.ts`](../../vite.config.ts) |
| Test | `pnpm test` → `vp test` (vitest) | [`package.json`](../../package.json) |
| Type-check | `pnpm check` → `vp check` | [`package.json`](../../package.json) |
| Lint | `pnpm lint` → `vp lint` | [`package.json`](../../package.json) |
| Format | `pnpm fmt` → `vp fmt` | [`vite.config.ts`](../../vite.config.ts) |
| Dev | `pnpm dev` → `vp dev` | [`package.json`](../../package.json) |

CI runs `vp fmt` → `vp check` → `vp test` → `vp pack` on push/PR to `main`. Release pipeline (`release.yml`) uses changesets with OIDC trusted npm publishing (Node 24, pnpm).

## Language breakdown

| Language | LOC | Files | % |
|----------|-----|-------|---|
| TypeScript | 4540 | 49 | 36% |
| YAML | 3907 | 6 | 31% |
| Markdown | 2246 | 17 | 17% |
| JavaScript | 957 | 7 | 7% |
| JSON | 874 | 8 | 6% |
| Shell | 58 | 1 | <1% |

## DevOps & CI

CI: GitHub Actions ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)), Node 22 via `voidzero-dev/setup-vp@v1`. Releases: changesets (`@changesets/changelog-github`), targeting `main`, OIDC trusted npm publish (no stored token); `pnpm/action-setup@v4` resolves pnpm version from the `packageManager` field in [`package.json`](../../package.json) (no `version:` key set — setting both conflicts). Binary invokable via `npx ghost-mcp` or `bunx ghost-mcp`.

---

## Domains

| Domain | Repo paths | One-liner | Detail |
|--------|------------|-----------|--------|
| mcp-server | [`src/index.ts`](../../src/index.ts), [`bin/`](../../bin), [`.github/`](../../.github) | MCP server bootstrap: registers 6 tools + 1 prompt (`compose_ghost_post`), stdio transport, env-driven API mode | [`.claude/project/signals/mcp-server.md`](signals/mcp-server.md) |
| actions | [`src/actions/`](../../src/actions) | Ghost API action registry: 18 files × typed `ActionDefinition` objects, Zod schemas, keyed Map store | [`.claude/project/signals/actions.md`](signals/actions.md) |
| client-tools | [`src/ghost-client.ts`](../../src/ghost-client.ts), [`src/types.ts`](../../src/types.ts), [`src/tools/`](../../src/tools), [`src/koenig/`](../../src/koenig) | HTTP clients + 6 MCP tool handlers: `use_ghost_api`, `ghost_api_help`, `ghost_docs`, `compose_post`, `compose_lexical`, `koenig_help`; Koenig composition layer ([`src/koenig/`](../../src/koenig)) converts structured block arrays to Lexical JSON; `compose_post`/`compose_lexical` accept blocks inline or via `blockFile` (abs path to local JSON) resolved by `blocks-source.ts` | [`.claude/project/signals/client-tools.md`](signals/client-tools.md) |
| experimentation | [`docker-compose.yml`](../../docker-compose.yml), [`.noorm/`](../../.noorm), [`bin/ghost-keys.sh`](../../bin/ghost-keys.sh), [`sql/`](../../sql), [`changes/`](../../changes), [`scripts/koenig/`](../../scripts/koenig), [`docs/koenig-cards.md`](../../docs/koenig-cards.md), [`docs/koenig-cards.json`](../../docs/koenig-cards.json), [`docs/koenig-node-specs.json`](../../docs/koenig-node-specs.json), [`.mcp.json`](.mcp.json) | Local Ghost 6 + MySQL 8 stack, noorm MCP DB inspection, Koenig card lexical payload harness (25 card types), and static node-spec extractor from Koenig source | [`.claude/project/signals/experimentation.md`](signals/experimentation.md) |

## Cross-cutting

- Tests live in [`src/__tests__/`](../../src/__tests__) with subdirs mirroring [`src/actions/`](../../src/actions), [`src/tools/`](../../src/tools), and [`src/koenig/`](../../src/koenig); vitest is the runner. [`vite.config.ts`](../../vite.config.ts) `test` block scopes vitest discovery to `src/**`.
- All repo-root-relative path citations link to `.claude/project/signals/<domain>.md` detail files.
- Deterministic substrate: [`.claude/project/deterministic-signals.md`](deterministic-signals.md).
- Domain partitioning basis: functional concern — mcp-server owns the MCP wiring and release pipeline; actions owns all Ghost API operation definitions and the registry Map; client-tools owns the HTTP transport layer, type library, all 6 MCP tool handlers, and the [`src/koenig/`](../../src/koenig) composition layer that converts block arrays to Lexical JSON; experimentation owns the local Docker/noorm stack, noorm MCP server registration ([`.mcp.json`](../../.mcp.json)), and the Koenig card harness ([`scripts/koenig/`](../../scripts/koenig)) used for live API testing, schema inspection, lexical payload derivation (25 card types including `extended-quote` and `aside`), and static node-spec extraction from the Koenig upstream source. The registry (actions) is a shared dependency: both client-tools (`use-ghost-api.ts`, `ghost-api-help.ts`) import from it; changes to `ActionDefinition` or `ApiType` propagate to client-tools. The [`src/koenig/`](../../src/koenig) module is internal to client-tools; `compose-post.ts` delegates to `handleUseGhostApi` for final dispatch, so koenig changes can also affect mcp-server tool surface. The experimentation domain's `bin/ghost-keys.sh --write` produces the `.env` consumed by the mcp-server at startup and by five of the six `scripts/koenig/*.mjs` scripts (`extract-specs.mjs` is stack-independent).
