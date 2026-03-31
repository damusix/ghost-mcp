---
'@damusix/ghost-mcp': patch
---

Fix admin API authentication — all authenticated endpoints were returning 403 Forbidden because the JWT Authorization header was never being sent. Now uses hooks.add('beforeRequest') to set a fresh JWT on every request.
