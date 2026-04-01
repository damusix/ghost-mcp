---
'@damusix/ghost-mcp': minor
---

Add resilience to all FetchEngine clients: retry with exponential backoff, 60-min response cache with stale-while-revalidate, request deduplication, rate limiting (configurable via `GHOST_RATE_LIMIT` env var), and request timeouts. Replace manual docs cache with dedicated FetchEngine instance. Use unauthenticated global fetch for file downloads in image/theme uploads.
