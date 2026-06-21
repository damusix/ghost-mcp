---
'@damusix/ghost-mcp': minor
---

Support composing posts from a JSON file on disk via `blockFile`.

`compose_post` and `compose_lexical` now accept either inline `blocks` or a `blockFile` — an absolute path to a local JSON file containing a bare `[...]` array or `{ "blocks": [...] }`. This lets a client draft long posts in its own working file (validating with `compose_lexical` as it edits) and pass just the path, instead of re-sending the whole block array on every change. Exactly one of `blocks` or `blockFile` is required.
