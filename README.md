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

### `use_ghost_api`

Execute Ghost API actions. Supports full CRUD on posts, pages, tags, members, newsletters, offers, tiers, users, webhooks, images, themes, and site settings.

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
