---
'@damusix/ghost-mcp': patch
---

Surface Ghost API error details and return clean response bodies from `use_ghost_api`:

- Failed requests now return the Ghost error body (`status` plus `errors[]` with `message`, `context`, `type`, and `property`) instead of only the HTTP status text, so validation failures explain what actually went wrong.
- Successful responses now return the Ghost body directly instead of the HTTP transport wrapper — pagination metadata (`meta.pagination`) is visible at the top level, and internal request config (including the admin `Authorization` header) no longer appears in tool output.
- `posts.add`/`posts.edit` and `pages.add`/`pages.edit` accept tags as plain name strings in addition to `{ id }` / `{ name }` objects.
- `offers.browse` accepts a `filter` parameter (e.g. `status:active`).
