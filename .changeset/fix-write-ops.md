---
'@damusix/ghost-mcp': patch
---

Fix all write operations (posts.add, tags.add, posts.edit, etc.) returning 422 Unprocessable Entity. Added missing Content-Type header and fixed path param stripping that was removing required body fields like `name` from tag payloads.
