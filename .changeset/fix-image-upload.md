---
'@damusix/ghost-mcp': patch
---

Fix image/theme uploads returning 422 by setting proper MIME types via mime-db and using per-request `onBeforeReq` to remove Content-Type header so the multipart boundary is auto-generated.
