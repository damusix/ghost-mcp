# Project signals

## Framework & runtime

TypeScript ESM package (`"type": "module"`), Node.js, built with `vite-plus` (`vp`). MCP server over stdio transport using `@modelcontextprotocol/sdk`. HTTP via `@logosdx/fetch` `FetchEngine` with built-in retry/cache/rate-limit/dedupe. Zod for all schema validation. JWT (`jsonwebtoken`, HS256) for Ghost Admin API auth. Published as `@damusix/ghost-mcp` v0.3.0.

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
| YAML | 3907 | 6 | 47% |
| TypeScript | 2998 | 33 | 36% |
| Markdown | 1165 | 12 | 14% |
| JSON | 176 | 5 | 2% |
| Shell | 58 | 1 | <1% |
| JavaScript | 2 | 1 | <1% |

## DevOps & CI

CI: GitHub Actions ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)), Node 22 via `voidzero-dev/setup-vp@v1`. Releases: changesets (`@changesets/changelog-github`), targeting `main`, OIDC trusted npm publish (no stored token). Binary invokable via `npx ghost-mcp` or `bunx ghost-mcp`.

---

## Domains

| Domain | Repo paths | One-liner | Detail |
|--------|------------|-----------|--------|
| mcp-server | [`src/index.ts`](../../src/index.ts), [`bin/`](../../bin), [`.github/`](../../.github) | MCP server bootstrap: registers 3 tools, stdio transport, env-driven API mode | [`.claude/project/signals/mcp-server.md`](signals/mcp-server.md) |
| actions | [`src/actions/`](../../src/actions) | Ghost API action registry: 18 files × typed `ActionDefinition` objects, Zod schemas, keyed Map store | [`.claude/project/signals/actions.md`](signals/actions.md) |
| client-tools | [`src/ghost-client.ts`](../../src/ghost-client.ts), [`src/types.ts`](../../src/types.ts), [`src/tools/`](../../src/tools) | HTTP clients + 3 MCP tool handlers: `use_ghost_api`, `ghost_api_help`, `ghost_docs` | [`.claude/project/signals/client-tools.md`](signals/client-tools.md) |
| experimentation | [`docker-compose.yml`](../../docker-compose.yml), [`.noorm/`](../../.noorm), [`bin/ghost-keys.sh`](../../bin/ghost-keys.sh), [`sql/`](../../sql), [`changes/`](../../changes) | Local Ghost 6 + MySQL 8 stack with noorm schema inspection for live API testing | [`.claude/project/signals/experimentation.md`](signals/experimentation.md) |

## Cross-cutting

- Tests live in [`src/__tests__/`](../../src/__tests__) with subdirs mirroring [`src/actions/`](../../src/actions) and [`src/tools/`](../../src/tools); vitest is the runner.
- All repo-root-relative path citations link to `.claude/project/signals/<domain>.md` detail files.
- Deterministic substrate: [`.claude/project/deterministic-signals.md`](deterministic-signals.md).
- Domain partitioning basis: functional concern — mcp-server owns the MCP wiring and release pipeline; actions owns all Ghost API operation definitions and the registry Map; client-tools owns the HTTP transport layer, type library, and the 3 MCP tool handlers that glue registry + HTTP together; experimentation owns the local Docker/noorm stack used for live API testing and schema inspection. The registry (actions) is a shared dependency: both client-tools (`use-ghost-api.ts`, `ghost-api-help.ts`) import from it; changes to `ActionDefinition` or `ApiType` propagate to client-tools. The experimentation domain's `bin/ghost-keys.sh --write` produces the `.env` consumed by the mcp-server at startup.
