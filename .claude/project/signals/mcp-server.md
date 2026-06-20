# mcp-server

## What it does

Implements a stdio-transport MCP server (`ghost-mcp`) that exposes three tools — `use_ghost_api`, `ghost_api_help`, and `ghost_docs` — allowing LLMs to interact with Ghost CMS via its Admin and Content APIs.
The server reads `GHOST_API_MODE` at startup (defaults to `"admin"`) and passes the mode through to every `use_ghost_api` call.
The package is published publicly to npm as `@damusix/ghost-mcp` and invokable via `npx`.

## Artifacts

- [`bin/ghost-mcp.js`](../../../bin/ghost-mcp.js) — CLI entry point; side-effect imports `dist/index.mjs` at runtime (no exports; the import executes the module as the entry point); this is the file the `ghost-mcp` bin key in [`package.json`](../../../package.json) points to
- `dist/index.mjs` — ESM build output produced by `vp pack`; the `main` field in [`package.json`](../../../package.json)
- `dist/index.d.mts` — generated type declarations; the `types` field in [`package.json`](../../../package.json)
- [`package.json`](../../../package.json) — declares name `@damusix/ghost-mcp`, version `0.3.0`, [`bin`](../../../bin), `files` ([`bin`](../../../bin), `dist`), ESM module type, and npm `publishConfig.access: "public"`
- [`.changeset/config.json`](../../../.changeset/config.json) — changesets config targeting `main` branch, public access, GitHub changelog via `@changesets/changelog-github` for `damusix/ghost-mcp`

## CLI code

- [`src/index.ts`](../../../src/index.ts) — MCP server bootstrap: constructs `McpServer` (`ghost-mcp` / `0.1.0`), registers the three tools, connects via `StdioServerTransport`, and calls `process.exit(1)` on fatal error
- [`vite.config.ts`](../../../vite.config.ts) — build config via `vite-plus`; entry is [`src/index.ts`](../../../src/index.ts), output format is ESM only, sourcemaps enabled, `.d.ts` generation on
- [`tsconfig.json`](../../../tsconfig.json) — `strict: true`, target `ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`, `outDir: dist`; only [`src/`](../../../src) is included

## Docs

- [`README.md`](../../../README.md) — user-facing setup guide: environment variables (`GHOST_URL`, `GHOST_ADMIN_API_KEY`, `GHOST_CONTENT_API_KEY`, `GHOST_API_MODE`, `GHOST_API_VERSION`), Claude Desktop and Claude Code config snippets, per-tool usage examples, and admin vs content mode explanation
- [`CHANGELOG.md`](../../../CHANGELOG.md) — version history maintained by changesets

## Coupling

- [`src/index.ts`](../../../src/index.ts) imports `./tools/use-ghost-api.js`, `./tools/ghost-api-help.js`, and `./tools/ghost-docs.js` — changes to any tool's exported schema shape or handler signature require matching updates in [`src/index.ts`](../../../src/index.ts)
- [`bin/ghost-mcp.js`](../../../bin/ghost-mcp.js) depends on `dist/index.mjs` existing; the build step (`vp pack`) must run before the binary is usable
- [`.github/workflows/release.yml`](../../../.github/workflows/release.yml) runs `vp pack` before changesets publish — any build config change in [`vite.config.ts`](../../../vite.config.ts) or [`tsconfig.json`](../../../tsconfig.json) affects the release artifact
- [`package.json`](../../../package.json) `files` field ([`bin`](../../../bin), `dist`) controls what is published; adding new top-level output directories requires updating this field

## Conventions worth knowing

- All scripts delegate to `vite-plus` (`vp`) CLI: `vp pack` builds, `vp test` runs vitest, `vp check` type-checks, `vp lint` lints, `vp fmt` formats
- CI runs `vp fmt` (step named "Auto-fix formatting") with no explicit flags, then `vp check`, `vp test`, and `vp pack` in sequence on push/PR to `main`
- CI uses Node 22 via `voidzero-dev/setup-vp@v1`; release uses Node 24 with pnpm and npm OIDC trusted publishing (no stored `NODE_AUTH_TOKEN`)
- The server version string in [`src/index.ts`](../../../src/index.ts) (`0.1.0`) is hardcoded and does not track [`package.json`](../../../package.json) version (`0.3.0`)
- `GHOST_API_MODE` is read once at process startup in [`src/index.ts`](../../../src/index.ts) and not re-evaluated per request
