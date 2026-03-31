# Build Ghost MCP Server

## Goal

Build `@damusix/ghost-mcp` — a publishable NPM package that is a TypeScript MCP server giving LLMs full control over a Ghost instance via 3 tools: `use_ghost_api`, `ghost_api_help`, and `ghost_docs`. The server supports two modes — **content** (read-only Content API) and **admin** (full Admin API + Content API). All inputs are Zod-validated. The action catalog is self-documenting, derived from Zod schemas (like OpenAPI from Joi/Zod). The package must be publishable to NPM and executable via `npx @damusix/ghost-mcp`.

Read `docs/ralph-loop/evidence/` for comprehensive R&D on every Ghost API endpoint, object schema, webhook event, architecture decision, and tooling choice before writing any code.

## Tasks

### Phase 1: Project Scaffolding

- [x] Run `vp create` or manually initialize project. `package.json` with `name: @damusix/ghost-mcp`, `"type": "module"`. Set `"bin": { "ghost-mcp": "./dist/index.js" }` so it's executable via `npx @damusix/ghost-mcp`. Set `"main": "./dist/index.js"`, `"types": "./dist/index.d.ts"`, `"files": ["dist"]` for publishing. Set `"publishConfig": { "access": "public" }`. Set `"author": "Danilo Alonso <danilo@alonso.network>"`. Add `"repository": { "type": "git", "url": "https://github.com/damusix/ghost-mcp.git" }`, `"license": "MIT"`, `"description": "MCP server for Ghost CMS — manage content, members, newsletters, and more via LLMs"`, `"keywords": ["ghost", "mcp", "cms", "llm", "ai"]`. Dependencies: `@modelcontextprotocol/sdk`, `zod`, `jsonwebtoken`, `@logosdx/fetch`, `@logosdx/utils`. Dev dependencies: `typescript`, `vite-plus`, `vitest`, `@types/jsonwebtoken`, `@changesets/cli`, `@changesets/changelog-github`. Use PNPM (`pnpm install`).
- [x] Create `tsconfig.json` (strict, ES2022, NodeNext module resolution, outDir dist, declaration: true, declarationMap: true, include src)
- [x] Configure Vite+ for building: use `vp build` / `vp pack` for library output (entry: `src/index.ts`, format: esm, target: node20). Ensure it produces `.d.ts` declaration files. If Vite+ config is needed, create it; otherwise rely on defaults + package.json config.
- [x] Create `src/index.ts` — MCP server entrypoint with `#!/usr/bin/env node` shebang at top (for npx execution). Use `@modelcontextprotocol/sdk`. Register 3 tools: `use_ghost_api`, `ghost_api_help`, `ghost_docs`. Use stdio transport. Read config from env vars: `GHOST_URL`, `GHOST_ADMIN_API_KEY`, `GHOST_CONTENT_API_KEY`, `GHOST_API_MODE` (content|admin, default: admin).

### Phase 2: Ghost API Client

- [x] Create `src/ghost-client.ts` — HTTP client using `@logosdx/fetch` FetchEngine. Create two FetchEngine instances: one for Admin API (`baseUrl: {GHOST_URL}/ghost/api/admin`), one for Content API (`baseUrl: {GHOST_URL}/ghost/api/content`). Admin instance: set `Authorization: Ghost {jwt}` header via hooks/headers manager, generate JWT (HS256, 5-min expiry, audience `/admin/`, key format `{id}:{secret}`) before each request. Content instance: append `?key={key}` to all requests via params manager. Both: set `Accept-Version: v5.0` header. Export `adminApi` and `contentApi` FetchEngine instances. Use `@logosdx/utils` `attempt()` for error handling.
- [x] Create `src/types.ts` — TypeScript types for Ghost API responses: `GhostPost`, `GhostPage`, `GhostTag`, `GhostAuthor`, `GhostMember`, `GhostNewsletter`, `GhostOffer`, `GhostTier`, `GhostUser`, `GhostWebhook`, `GhostTheme`, `GhostImage`, `GhostPaginationMeta`. These are for internal use, not for validation.

### Phase 3: Action Registry & Zod Schemas

- [x] Create `src/actions/registry.ts` — Central action registry. Each action has: `name` (e.g. `posts.browse`), `api` (`admin` | `content`), `method` (HTTP), `path` (with `{id}` / `{slug}` / `{name}` placeholders), `inputSchema` (Zod), `description`, `example` (sample payload). Export `getAction(name)`, `listActions(api?)`, `getActionHelp(name)`.
- [x] Create `src/actions/admin/posts.ts` — Admin post actions: `posts.browse` (params: include, formats, filter, limit, page, order), `posts.read` (id, include, formats), `posts.read_by_slug` (slug, include, formats), `posts.add` (title required; optional: lexical, status, tags, authors, featured, visibility, published_at, custom_excerpt, meta_title, meta_description, og_image, og_title, og_description, twitter_image, twitter_title, twitter_description, codeinjection_head, codeinjection_foot, canonical_url, feature_image, feature_image_alt, feature_image_caption, custom_template, newsletter, email_subject), `posts.edit` (id required + all add fields + `updated_at` required for collision detection), `posts.copy` (id), `posts.delete` (id). Every Zod field must have `.describe()` with a clear explanation.
- [x] Create `src/actions/admin/pages.ts` — Same structure as posts (pages are structurally identical). Actions: `pages.browse`, `pages.read`, `pages.read_by_slug`, `pages.add`, `pages.edit`, `pages.copy`, `pages.delete`.
- [x] Create `src/actions/admin/tags.ts` — Actions: `tags.browse`, `tags.read`, `tags.add` (name required; optional: slug, description, feature_image, visibility, meta_title, meta_description, og_image, og_title, og_description, twitter_image, twitter_title, twitter_description, codeinjection_head, codeinjection_foot, canonical_url, accent_color), `tags.edit` (id + all add fields + updated_at), `tags.delete` (id).
- [x] Create `src/actions/admin/tiers.ts` — Actions: `tiers.browse` (filter, include, limit, page, order), `tiers.read` (id, include), `tiers.add` (name required; optional: description, welcome_page_url, visibility, monthly_price, yearly_price, currency, benefits), `tiers.edit` (id + all add fields).
- [x] Create `src/actions/admin/newsletters.ts` — Actions: `newsletters.browse` (limit, page, order), `newsletters.read` (id), `newsletters.add` (name required; optional: description, slug, sender_name, sender_email, sender_reply_to, status, visibility, subscribe_on_signup, sort_order, header_image, show_header_icon, show_header_title, show_header_name, title_font_category, title_alignment, show_feature_image, body_font_category, footer_content, show_badge), `newsletters.edit` (id + all add fields).
- [x] Create `src/actions/admin/offers.ts` — Actions: `offers.browse`, `offers.read` (id), `offers.add` (name, code, display_title, display_description, type, cadence, amount, duration required; optional: duration_in_months, currency_restriction, currency, tier.id), `offers.edit` (id + subset of fields).
- [x] Create `src/actions/admin/members.ts` — Actions: `members.browse` (include, filter, limit, page, order), `members.read` (id, include), `members.add` (email required; optional: name, note, labels, newsletters, comped), `members.edit` (id + all add fields).
- [x] Create `src/actions/admin/users.ts` — Read-only. Actions: `users.browse` (include, limit, page, order), `users.read` (id, include).
- [x] Create `src/actions/admin/images.ts` — Action: `images.upload`. Input: `{ file: string (URL or base64), ref?: string }`. The MCP tool will download the URL or decode base64, then multipart POST to Ghost.
- [x] Create `src/actions/admin/themes.ts` — Actions: `themes.upload` (file: URL or base64 of ZIP), `themes.activate` (name).
- [x] Create `src/actions/admin/webhooks.ts` — Actions: `webhooks.add` (event required from enum of all 33 events, target_url required; optional: name, secret, api_version, integration_id), `webhooks.edit` (id + all add fields), `webhooks.delete` (id).
- [x] Create `src/actions/admin/site.ts` — Action: `site.read` (no params).
- [x] Create `src/actions/content/posts.ts` — Content API post actions: `posts.browse`, `posts.read`, `posts.read_by_slug`. Same query params as admin but read-only.
- [x] Create `src/actions/content/pages.ts` — Content API page actions: same pattern.
- [x] Create `src/actions/content/tags.ts` — Content API tag actions: `tags.browse`, `tags.read`, `tags.read_by_slug`. Include: `count.posts`.
- [x] Create `src/actions/content/authors.ts` — Actions: `authors.browse`, `authors.read`, `authors.read_by_slug`. Include: `count.posts`.
- [x] Create `src/actions/content/tiers.ts` — Action: `tiers.browse` (include: monthly_price, yearly_price, benefits; filter by type, visibility, active).
- [x] Create `src/actions/content/settings.ts` — Action: `settings.read` (no params).

### Phase 4: MCP Tool Handlers

- [x] Create `src/tools/use-ghost-api.ts` — The main tool. Zod input: `{ api: z.enum(["admin", "content"]), action: z.string(), payload: z.record(z.unknown()).optional() }`. Validates mode (if content mode, reject admin actions). Looks up action in registry, validates payload against action's Zod schema, builds HTTP request (substitute `{id}`, `{slug}`, `{name}` from payload into path, pass query params for GET, JSON body for POST/PUT), calls ghost-client FetchEngine, returns JSON response. Handle errors with clear messages.
- [x] Create `src/tools/ghost-api-help.ts` — Self-documenting tool. Zod input: `{ action: z.string().optional() }`. No action → return grouped list of all actions with one-line descriptions, organized by resource and API. With action → return: full Zod schema as human-readable description (field name, type, required/optional, description, default), example payload, example response shape, notes. Derive descriptions from Zod `.describe()` metadata. Format output as structured markdown.
- [x] Create `src/tools/ghost-docs.ts` — Documentation search tool. Zod input: `{ all: z.boolean().optional(), search: z.string().optional(), regex: z.string().optional() }`. `all: true` → fetch and return full content of `https://docs.ghost.org/llms.txt`. `search` → fuzzy line-by-line match (case-insensitive substring). `regex` → parse regex string with flags, match per-line. Cache the llms.txt content for 15 minutes. Return matching lines with context.

### Phase 5: Tests

- [x] Create `src/__tests__/ghost-client.test.ts` — Unit tests for ghost-client: JWT generation produces valid tokens with correct header/payload structure, Content API appends key param, both engines set Accept-Version header. Mock FetchEngine internals — do NOT hit a real Ghost instance.
- [x] Create `src/__tests__/registry.test.ts` — Unit tests for action registry: `listActions()` returns all actions, `listActions('admin')` filters correctly, `listActions('content')` filters correctly, `getAction('posts.browse')` returns correct action shape, `getAction('nonexistent')` returns undefined, `getActionHelp('posts.add')` returns schema description with all fields.
- [x] Create `src/__tests__/tools/use-ghost-api.test.ts` — Unit tests for the main tool: validates payload against Zod schema (rejects invalid), correctly substitutes `{id}` into path, rejects admin actions in content mode, builds correct query params for GET requests, builds correct JSON body for POST/PUT.
- [x] Create `src/__tests__/tools/ghost-api-help.test.ts` — Unit tests: no-arg call returns grouped action list, action-specific call returns schema details with descriptions, unknown action returns helpful error.
- [x] Create `src/__tests__/tools/ghost-docs.test.ts` — Unit tests: `all: true` returns cached content, `search` filters lines case-insensitively, `regex` applies regex with flags, caching works (second call doesn't re-fetch within 15 min). Mock the fetch to llms.txt.
- [x] Create `src/__tests__/actions/admin-posts.test.ts` — Zod schema validation tests for post actions: `posts.add` requires title, `posts.edit` requires id and updated_at, `posts.browse` accepts all query params, invalid fields are rejected.
- [x] Create `src/__tests__/actions/content-posts.test.ts` — Zod schema validation tests for content post actions: only read params accepted, no write fields allowed.
- [x] Run `vp test` — all tests pass with zero failures.

### Phase 6: Integration, Build & Publish Readiness

- [x] Wire all action files into `src/actions/registry.ts` — import and register every action module.
- [x] Wire all tool handlers into `src/index.ts` — register `use_ghost_api`, `ghost_api_help`, `ghost_docs` with the MCP server.
- [x] Run `vp check` — format, lint, typecheck all pass.
- [x] Run `vp build` or `vp pack` — produces `dist/index.js` (with shebang) and `dist/index.d.ts`. No errors.
- [x] Run `vp test` — all tests pass.
- [x] Verify publish readiness: `pnpm pack --dry-run` lists only expected files (dist/, package.json, README.md, LICENSE). Ensure `dist/index.js` starts with `#!/usr/bin/env node`. Ensure `bin` field in package.json points to `./dist/index.js`.
- [x] Create `LICENSE` file (MIT, author: Danilo Alonso).
- [x] Create `README.md` with: package name (`@damusix/ghost-mcp`), what this is, install via `pnpm add @damusix/ghost-mcp` or run via `npx @damusix/ghost-mcp`, env vars (`GHOST_URL`, `GHOST_ADMIN_API_KEY`, `GHOST_CONTENT_API_KEY`, `GHOST_API_MODE`), MCP config examples for Claude Desktop and Claude Code (`{"mcpServers": {"ghost": {"command": "npx", "args": ["@damusix/ghost-mcp"], "env": {...}}}}`), tool descriptions with usage examples, content vs admin mode explanation.

### Phase 7: Changesets & GitHub Actions CI/CD

- [x] Run `pnpm changeset init` to create `.changeset/` directory with `config.json`. Configure: `"access": "public"`, `"baseBranch": "main"`, `"changelog": ["@changesets/changelog-github", { "repo": "damusix/ghost-mcp" }]`.
- [x] Create `.github/workflows/ci.yml` — CI workflow. Triggers on push to `main` and all PRs. Steps: checkout, setup Node (20), setup PNPM (`pnpm/action-setup`), `pnpm install --frozen-lockfile`, `vp check`, `vp test`, `vp build`.
- [x] Create `.github/workflows/release.yml` — Release workflow. Triggers on push to `main`. Steps: checkout, setup Node (20), setup PNPM, `pnpm install --frozen-lockfile`, `vp build`. Then use `changesets/action` with `publish: pnpm changeset publish`, `title: "chore: version packages"`. Requires `NPM_TOKEN` secret for npm publish and `GITHUB_TOKEN` for creating the version PR.
- [x] Create `.npmrc` with `//registry.npmjs.org/:_authToken=${NPM_TOKEN}` (for CI publish only — this file is safe to commit).
- [x] Add `.changeset/` to git. Verify `pnpm changeset status` runs without error.
    - `pnpm changeset status` fails locally because there is no `main` branch (only `master`). This will work correctly on GitHub where `main` exists as the default branch.

## Constraints

- **Package manager**: PNPM exclusively. All install/add commands use `pnpm`.
- **Toolchain**: Vite+ (`vp`). Use `vp check`, `vp test`, `vp build`/`vp pack` — NOT raw `tsc`, `vitest`, etc.
- **HTTP client**: `@logosdx/fetch` FetchEngine — NOT native fetch, axios, or node-fetch. Use `@logosdx/utils` `attempt()` for error handling.
- **MCP SDK**: `@modelcontextprotocol/sdk` for MCP server implementation (stdio transport)
- **Validation**: Zod for ALL input validation — every action schema field must have `.describe()`
- **JWT**: `jsonwebtoken` package for Admin API auth
- **Testing**: Vitest (via `vp test`). Mock HTTP calls — never hit a real Ghost instance in tests.
- All source in `src/`, tests in `src/__tests__/`
- ESM only (`"type": "module"` in package.json)
- **Publishable**: `bin` field, shebang in entrypoint, `files: ["dist"]`, `publishConfig.access: "public"`, declarations emitted
- **Versioning**: `pnpm changeset` for versioning. Never manually edit version in package.json.
- **CI/CD**: GitHub Actions for CI (check/test/build on PRs) and release (changeset publish on main). NPM publish via `changesets/action`.
- Do NOT use `git add .` — always add specific files
- Content mode must reject admin-only actions with a clear error message
- Every Zod schema field must have `.describe()` — this is what powers `ghost_api_help`
- Image/theme upload: accept URL string in payload, download and re-upload as multipart. Do NOT require the LLM to provide raw binary data.
- Read `docs/ralph-loop/evidence/architecture-decisions.md` for the full action naming convention and routing table
- Read `docs/ralph-loop/evidence/tooling.md` for FetchEngine API patterns and Vite+ commands

## Notes

- At the end of each iteration, update this `docs/ralph-loop/ralph-prompt.md` with completed tasks.
- Only add [x] to tasks you have completed.
- If something is impossible, strike it out and explain why in a sub-bullet.
- Do not add any other text or comments to this file.
- DO NOT mark a task as complete if `vp check` or `vp test` fails. Fix the failure first.

## Done When

All tasks above are checked and every quality check passes:

1. `vp check` passes (format + lint + typecheck)
2. `vp build` or `vp pack` produces `dist/index.js` + `dist/index.d.ts`
3. `vp test` passes with zero failures
4. All action modules registered and `ghost_api_help` returns full catalog
5. `pnpm pack --dry-run` shows clean publishable package
6. `dist/index.js` has `#!/usr/bin/env node` shebang
7. README.md + LICENSE exist
8. `.changeset/config.json` exists with correct config
9. `.github/workflows/ci.yml` and `.github/workflows/release.yml` exist
10. `pnpm changeset status` runs without error
