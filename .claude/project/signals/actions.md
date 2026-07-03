# actions

## What it does

Defines every Ghost API operation as a typed `ActionDefinition` object (name, api, method, path, Zod input schema, description, optional example) and registers them in a module-level `Map<string, ActionDefinition>` keyed `"<api>:<name>"`. Exports `registerAction`, `registerActions`, `getAction`, `listActions`, and `getActionHelp` for use by MCP tool handlers. The registry is populated at module load time by `initRegistry()` in [`src/actions/registry.ts`](../../../src/actions/registry.ts).

## CLI code

- [`src/actions/registry.ts`](../../../src/actions/registry.ts) — central registry: `ActionDefinition` interface, `HttpMethod`/`ApiType` types, Map store, all register/query/help exports, `describeZodType`/`unwrapZodType` helpers for schema introspection, `initRegistry` that imports and bulk-registers all 18 action arrays
- [`src/actions/admin/posts.ts`](../../../src/actions/admin/posts.ts) — 7 admin post actions: `posts.browse`, `posts.read`, `posts.read_by_slug`, `posts.add`, `posts.edit`, `posts.copy`, `posts.delete`
- [`src/actions/admin/pages.ts`](../../../src/actions/admin/pages.ts) — 7 admin page actions mirroring the post action set (browse, read, read_by_slug, add, edit, copy, delete)
- [`src/actions/admin/tags.ts`](../../../src/actions/admin/tags.ts) — 5 admin tag actions: browse, read, add, edit, delete
- [`src/actions/admin/tiers.ts`](../../../src/actions/admin/tiers.ts) — 4 admin tier actions: browse, read, add, edit (no delete)
- [`src/actions/admin/newsletters.ts`](../../../src/actions/admin/newsletters.ts) — 4 admin newsletter actions: browse, read, add, edit (no delete)
- [`src/actions/admin/offers.ts`](../../../src/actions/admin/offers.ts) — 4 admin offer actions: browse, read, add, edit (no delete); `offers.browse` now takes an optional `filter` param (NQL expression, e.g. `"status:active"`)
- [`src/actions/admin/members.ts`](../../../src/actions/admin/members.ts) — 4 admin member actions: browse, read, add, edit (no delete)
- [`src/actions/admin/users.ts`](../../../src/actions/admin/users.ts) — 2 admin user actions: browse, read (read-only)
- [`src/actions/admin/images.ts`](../../../src/actions/admin/images.ts) — 1 admin action: `images.upload`
- [`src/actions/admin/themes.ts`](../../../src/actions/admin/themes.ts) — 2 admin theme actions: `themes.upload`, `themes.activate`
- [`src/actions/admin/webhooks.ts`](../../../src/actions/admin/webhooks.ts) — 3 admin webhook actions: add, edit, delete (no browse/read); `event` is a shared `z.enum(...)` of 29 Ghost webhook event names, required on add and optional on edit
- [`src/actions/admin/site.ts`](../../../src/actions/admin/site.ts) — 1 admin action: `site.read` (no parameters)
- [`src/actions/content/posts.ts`](../../../src/actions/content/posts.ts) — 3 content post actions: browse, read, read_by_slug (read-only)
- [`src/actions/content/pages.ts`](../../../src/actions/content/pages.ts) — 3 content page actions: browse, read, read_by_slug (read-only)
- [`src/actions/content/tags.ts`](../../../src/actions/content/tags.ts) — 3 content tag actions: browse, read, read_by_slug (read-only)
- [`src/actions/content/authors.ts`](../../../src/actions/content/authors.ts) — 3 content author actions: browse, read, read_by_slug (read-only)
- [`src/actions/content/tiers.ts`](../../../src/actions/content/tiers.ts) — 1 content tier action: browse only (read-only)
- [`src/actions/content/settings.ts`](../../../src/actions/content/settings.ts) — 1 content action: `settings.read` (no parameters)

## Docs

(none)

## Coupling

- [`src/actions/registry.ts`](../../../src/actions/registry.ts) exports `ActionDefinition`, `HttpMethod`, `ApiType`, `getAction`, `listActions`, `getActionHelp` — consumed by the client-tools domain (its `use-ghost-api.ts` resolves actions via `getAction`; its `ghost-api-help.ts` renders help text via `listActions`/`getActionHelp`); adding, renaming, or reshaping an action here requires checking both consumers
- All 18 action files import `ActionDefinition` as a type from `../registry.js`; changing the `ActionDefinition` interface shape forces updates across all of them
- [`src/__tests__/registry.test.ts`](../../../src/__tests__/registry.test.ts) and `src/__tests__/actions/*.test.ts` (currently `admin-posts.test.ts` and `content-posts.test.ts`) call `getAction`/`listActions`/`getActionHelp` directly — test assertions are bound to registered action names, methods, paths, and accepted schema shapes (e.g. `admin-posts.test.ts` asserts `posts.add` accepts a `tags: [{ name: 'Test' }]` payload)

## Conventions worth knowing

- Registry key format is `"<api>:<name>"` (e.g. `"admin:posts.browse"`, `"content:posts.browse"`); the same logical name can exist under both `admin` and `content`
- `getAction(name)` with no api arg tries `admin` first, then falls back to `content`
- Write actions (add/edit) use Zod object spread from a shared `*WriteFields` const so that required-vs-optional status differs between add and edit schemas without duplicating field definitions; this pattern applies to posts, pages, tags, tiers, newsletters, and members — `offers` and `webhooks` define independent `z.object(...)` blocks for add and edit instead
- `posts.edit` and `pages.edit` require `updated_at` as a required field for optimistic concurrency collision detection
- `tags.edit` also requires `updated_at`; `members.edit`, `tiers.edit`, `newsletters.edit`, `offers.edit`, and `webhooks.edit` do not
- Content API action files contain only `GET` actions; no write operations exist under `api: 'content'`
- The `tags` write field on `posts` and `pages` accepts `z.union([z.string(), z.object({ id: z.string() }), z.object({ name: z.string() })])` — a plain tag name string, or an object with `id` or `name`; the analogous `labels` field on `members` only accepts `z.union([z.object({ id: z.string() }), z.object({ name: z.string() })])` (no plain-string form)
- `adminOfferActions` defines `offers.browse` with an optional `filter` field only (`z.object({ filter: z.string().optional()... })`) — no pagination/sort params, since Ghost's offers endpoint returns the full list without pagination meta
- `adminWebhookActions` has no browse or read actions, only add/edit/delete
- `adminUserActions` is read-only (browse, read) with no write actions
- Each action file exports a single named array constant (`adminXxxActions` / `contentXxxActions`); `initRegistry` spreads all of them into one array and calls `registerActions`
- Test files use Vitest; schemas are tested by calling `action.inputSchema.safeParse(...)` directly against the registered action retrieved via `getAction`
