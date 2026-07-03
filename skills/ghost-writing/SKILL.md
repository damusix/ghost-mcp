---
name: ghost-writing
description: 'Use when writing, editing, or publishing Ghost blog posts with the ghost-mcp server. Covers compose_post vs use_ghost_api, the full Koenig block catalog, and blog-writing best practices.'
---

# Ghost Writing

## Quick Start

    compose_post {
        "title": "We shipped the editor",
        "status": "draft",
        "blocks": [
            { "type": "heading", "level": 2, "text": "What changed" },
            { "type": "paragraph", "text": "Prose with **bold** and [links](https://ghost.org)." },
            { "type": "callout", "emoji": "🚀", "color": "green", "text": "Live now" }
        ]
    }

## Critical Rules

1. **Never push raw HTML** — compose posts from Koenig blocks via `compose_post`. The `html` block is a last resort when no native block fits.
2. **Draft first** — create with `status: "draft"`, report the post URL, publish only when asked.
3. **Long posts use `blockFile`** — write blocks JSON to an absolute path, validate with `compose_lexical`, pass the path to `compose_post`.
4. **Updates replace the whole body** — `compose_post` with `id` needs the current `updated_at` (via `posts.read`) and full blocks; keep the blockFile as source of truth when iterating.
5. **Don't guess block fields** — run `koenig_help` (list) or `koenig_help { "block": "callout" }` (fields + example) before composing.

## Workflow

1. Outline: one goal per post, working title, section list — see [writing](references/writing.md)
2. Pick blocks per section: prose vs cards — see [blocks](references/blocks.md)
3. Compose: `compose_post` with inline `blocks`, or `blockFile` for long posts
4. Review: re-read for rhythm, set excerpt/tags/feature image
5. Publish or schedule via `use_ghost_api` — see [workflows](references/workflows.md)

## References

- [Blocks](references/blocks.md) — every block type, its purpose, and how to choose between similar ones
- [Writing](references/writing.md) — structure, rhythm, metadata, and voice practices for good posts
- [Workflows](references/workflows.md) — tool map and end-to-end recipes: create, edit, publish, newsletter, members-only
