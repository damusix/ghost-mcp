# @damusix/ghost-mcp

MCP server for Ghost CMS — manage content, members, newsletters, and more via LLMs.

## Install

```bash
pnpm add @damusix/ghost-mcp
```

Or run directly:

```bash
npx --package=@damusix/ghost-mcp ghost-mcp
```

## Configuration

Set the following environment variables:

| Variable                | Required         | Description                                               |
| ----------------------- | ---------------- | --------------------------------------------------------- |
| `GHOST_URL`             | Yes              | Your Ghost instance URL (e.g. `https://my-blog.ghost.io`) |
| `GHOST_ADMIN_API_KEY`   | For admin mode   | Admin API key (`{id}:{secret}` format)                    |
| `GHOST_CONTENT_API_KEY` | For content mode | Content API key                                           |
| `GHOST_API_MODE`        | No               | `admin` (default) or `content`                            |
| `GHOST_API_VERSION`     | No               | API version header (default: `v6.0`)                      |

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
    "mcpServers": {
        "ghost": {
            "command": "npx",
            "args": ["@damusix/ghost-mcp"],
            "env": {
                "GHOST_URL": "https://my-blog.ghost.io",
                "GHOST_ADMIN_API_KEY": "your-admin-api-key",
                "GHOST_CONTENT_API_KEY": "your-content-api-key",
                "GHOST_API_MODE": "admin",
                "GHOST_API_VERSION": "v6.0"
            }
        }
    }
}
```

### Claude Code

```bash
claude mcp add ghost \
  -e GHOST_URL=https://my-blog.ghost.io \
  -e GHOST_ADMIN_API_KEY=your-admin-api-key \
  -e GHOST_CONTENT_API_KEY=your-content-api-key \
  -e GHOST_API_MODE=admin \
  -e GHOST_API_VERSION=v6.0 \
  -- npx @damusix/ghost-mcp
```

## Tools

### `compose_post`

Create or update a post from structured Koenig content blocks. Prefer this over
pushing raw HTML or hand-writing Lexical — it produces clean, natively-editable
posts. Prose blocks (`paragraph`, `heading`, `list`, `quote`) accept inline
markdown (`**bold**`, `_italic_`, `` `code` ``, `[links](url)`); rich features
are cards (`callout`, `image`, `button`, `bookmark`, `codeblock`, `toggle`,
`gallery`, and more). Omit `id` to create; set `id` + `updated_at` to update.

```json
{
    "title": "We shipped the editor",
    "status": "draft",
    "blocks": [
        { "type": "heading", "level": 2, "text": "What's new" },
        { "type": "paragraph", "text": "Try the **new** [editor](https://ghost.org)." },
        { "type": "list", "style": "bullet", "items": ["Clean blocks", "Native editing"] },
        { "type": "callout", "emoji": "🚀", "color": "green", "text": "Live now" },
        { "type": "button", "text": "Get started", "url": "https://ghost.org" }
    ]
}
```

Each block becomes a native Lexical node, so the post stays granularly editable
in Ghost — not a single opaque HTML block. See
[docs/koenig-cards.md](docs/koenig-cards.md) for every block type and field.

For long posts, write the blocks to a JSON file (a bare `[...]` array or
`{ "blocks": [...] }`) and pass its **absolute** path as `blockFile` instead of
`blocks` — useful when iterating, so you edit the file rather than re-sending the
whole array each time. Validate the file first with `compose_lexical`.

```json
{ "title": "Long post", "status": "draft", "blockFile": "/abs/path/tmp/post.json" }
```

### `compose_lexical`

Compile the same `blocks` into a Lexical JSON string without creating a post —
useful for preview or feeding into `use_ghost_api` yourself.

### `koenig_help`

List all block types, or get the fields and a JSON example for one block.

```json
{ "block": "callout" }
```

### `use_ghost_api`

Execute Ghost API actions. Supports full CRUD on posts, pages, tags, members, newsletters, offers, tiers, users, webhooks, images, themes, and site settings. For post bodies, prefer `compose_post` over passing raw `lexical`/`html` here.

```json
{
    "api": "admin",
    "action": "posts.add",
    "payload": {
        "title": "My New Post",
        "status": "draft",
        "lexical": "{\"root\":{\"children\":[{\"children\":[{\"text\":\"Hello world\"}],\"type\":\"paragraph\"}],\"type\":\"root\"}}"
    }
}
```

### `ghost_api_help`

Self-documenting tool that describes available actions and their schemas.

```json
{ "action": "posts.add" }
```

Call with no arguments to list all available actions.

### `ghost_docs`

Search Ghost documentation via `docs.ghost.org/llms.txt`.

```json
{ "all": true }
```

```json
{ "search": "webhooks" }
```

```json
{ "regex": "filter.*published" }
```

## Modes

- **Admin mode** (default): Full access to all Ghost Admin API and Content API actions. Requires `GHOST_ADMIN_API_KEY`.
- **Content mode**: Read-only access to Content API actions only. Requires `GHOST_CONTENT_API_KEY`. Admin actions are rejected with a clear error.

## Development

Spin up a throwaway Ghost 6 + MySQL 8 stack to exercise the server against a
live API, and inspect Ghost's real schema with noorm. See
[docs/experimentation.md](docs/experimentation.md).

```bash
docker compose up -d
bin/ghost-keys.sh --write   # writes .env pointed at the local Ghost
```

## License

MIT
