---
'@damusix/ghost-mcp': patch
---

ghost_docs no longer swallows fetch failures.

Removed the redundant `attempt` tuple + try/catch + error re-wrapping in the `ghost_docs` tool. A failed docs fetch now rejects and propagates (surfaced as a tool error) instead of being caught and returned as an `"Error: ..."` string. This matches the codebase's error-handling conventions and drops the `!`/`as` it relied on.
