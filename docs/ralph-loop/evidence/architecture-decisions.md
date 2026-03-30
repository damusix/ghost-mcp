# Architecture Decisions - Ghost MCP

## Decision: Own Doc Source vs. Live Fetch

**Decision: Hybrid approach - maintain our own reference docs AND provide live fetch.**

Why:

- Ghost docs are scattered, incomplete in places, and forum lore fills gaps
- Ghost doesn't change API often, so maintained docs stay valid
- Our own docs let us provide richer Zod descriptions, examples, and action catalogs
- Live fetch via `ghost_docs` tool gives LLMs access to upstream `llms.txt` as a fallback
- The `ghost_api_help` tool serves as our curated, always-available reference

## Decision: 3-Tool MCP Design

### Tool 1: `use_ghost_api`

- **Purpose**: Execute any Ghost API action
- **Input**: `{ api: "admin" | "content", action: string, payload?: object }`
- **Behavior**: Routes to the correct endpoint based on action string
- **Validation**: Zod schema per action validates payload before sending
- **Auth**: JWT for admin, API key for content - handled internally

### Tool 2: `ghost_api_help`

- **Purpose**: Self-documenting action catalog
- **Input**: `{}` (no args) returns all actions grouped by resource and API
- **Input**: `{ action: string }` returns detailed help for that action including:
  - Zod schema description with field types, optionality, defaults
  - Example payload
  - Example response
  - Notes/caveats
- **Design**: Derived from Zod schemas at build time (like OpenAPI from Joi/Zod)

### Tool 3: `ghost_docs`

- **Purpose**: Search Ghost documentation
- **Input**: `{ all: true }` dumps full llms.txt content
- **Input**: `{ search: "fuzzy term" }` fuzzy line-by-line match
- **Input**: `{ regex: "/pattern/flags" }` regex line-by-line match
- **Source**: Fetches from `https://docs.ghost.org/llms.txt` (cached)

## Decision: Two Modes

### Content Mode

- Only Content API actions available
- Read-only operations: browse/read posts, pages, tags, authors, tiers, settings
- Safe for content generation workflows
- Auth: Content API key only

### Admin Mode

- Full Admin API + Content API actions available
- CRUD on posts, pages, tags, tiers, newsletters, offers, members
- Theme upload/activate, image upload, webhook management
- Auth: Admin API key (JWT) + Content API key

Mode is determined by configuration (env vars / MCP server config).

## Decision: Action Naming Convention

Pattern: `{resource}.{verb}` mapped to HTTP method + endpoint.

### Admin API Actions

| Action               | Method | Endpoint                  |
| -------------------- | ------ | ------------------------- |
| `posts.browse`       | GET    | `/posts/`                 |
| `posts.read`         | GET    | `/posts/{id}/`            |
| `posts.read_by_slug` | GET    | `/posts/slug/{slug}/`     |
| `posts.add`          | POST   | `/posts/`                 |
| `posts.edit`         | PUT    | `/posts/{id}/`            |
| `posts.copy`         | POST   | `/posts/{id}/copy`        |
| `posts.delete`       | DELETE | `/posts/{id}/`            |
| `pages.browse`       | GET    | `/pages/`                 |
| `pages.read`         | GET    | `/pages/{id}/`            |
| `pages.read_by_slug` | GET    | `/pages/slug/{slug}/`     |
| `pages.add`          | POST   | `/pages/`                 |
| `pages.edit`         | PUT    | `/pages/{id}/`            |
| `pages.copy`         | POST   | `/pages/{id}/copy`        |
| `pages.delete`       | DELETE | `/pages/{id}/`            |
| `tags.browse`        | GET    | `/tags/`                  |
| `tags.read`          | GET    | `/tags/{id}/`             |
| `tags.add`           | POST   | `/tags/`                  |
| `tags.edit`          | PUT    | `/tags/{id}/`             |
| `tags.delete`        | DELETE | `/tags/{id}/`             |
| `tiers.browse`       | GET    | `/tiers/`                 |
| `tiers.read`         | GET    | `/tiers/{id}/`            |
| `tiers.add`          | POST   | `/tiers/`                 |
| `tiers.edit`         | PUT    | `/tiers/{id}/`            |
| `newsletters.browse` | GET    | `/newsletters/`           |
| `newsletters.read`   | GET    | `/newsletters/{id}/`      |
| `newsletters.add`    | POST   | `/newsletters/`           |
| `newsletters.edit`   | PUT    | `/newsletters/{id}/`      |
| `offers.browse`      | GET    | `/offers/`                |
| `offers.read`        | GET    | `/offers/{id}/`           |
| `offers.add`         | POST   | `/offers/`                |
| `offers.edit`        | PUT    | `/offers/{id}/`           |
| `members.browse`     | GET    | `/members/`               |
| `members.read`       | GET    | `/members/{id}/`          |
| `members.add`        | POST   | `/members/`               |
| `members.edit`       | PUT    | `/members/{id}/`          |
| `users.browse`       | GET    | `/users/`                 |
| `users.read`         | GET    | `/users/{id}/`            |
| `images.upload`      | POST   | `/images/upload/`         |
| `themes.upload`      | POST   | `/themes/upload`          |
| `themes.activate`    | PUT    | `/themes/{name}/activate` |
| `webhooks.add`       | POST   | `/webhooks/`              |
| `webhooks.edit`      | PUT    | `/webhooks/{id}/`         |
| `webhooks.delete`    | DELETE | `/webhooks/{id}/`         |
| `site.read`          | GET    | `/site/`                  |

### Content API Actions

| Action                 | Method | Endpoint                |
| ---------------------- | ------ | ----------------------- |
| `posts.browse`         | GET    | `/posts/`               |
| `posts.read`           | GET    | `/posts/{id}/`          |
| `posts.read_by_slug`   | GET    | `/posts/slug/{slug}/`   |
| `pages.browse`         | GET    | `/pages/`               |
| `pages.read`           | GET    | `/pages/{id}/`          |
| `pages.read_by_slug`   | GET    | `/pages/slug/{slug}/`   |
| `tags.browse`          | GET    | `/tags/`                |
| `tags.read`            | GET    | `/tags/{id}/`           |
| `tags.read_by_slug`    | GET    | `/tags/slug/{slug}/`    |
| `authors.browse`       | GET    | `/authors/`             |
| `authors.read`         | GET    | `/authors/{id}/`        |
| `authors.read_by_slug` | GET    | `/authors/slug/{slug}/` |
| `tiers.browse`         | GET    | `/tiers/`               |
| `settings.read`        | GET    | `/settings/`            |

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **MCP SDK**: `@modelcontextprotocol/sdk` (official MCP TypeScript SDK)
- **Validation**: Zod for all input/output schemas
- **JWT**: `jsonwebtoken` for Admin API auth
- **HTTP**: `node-fetch` or native fetch
- **Build**: tsup or tsc
- **Transport**: stdio (standard MCP transport)
