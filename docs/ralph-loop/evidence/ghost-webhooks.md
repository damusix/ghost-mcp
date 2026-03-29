# Ghost Webhooks - R&D Evidence

> Source: https://docs.ghost.org/webhooks + https://docs.ghost.org/admin-api/webhooks/overview (fetched 2026-03-29)

## API Endpoints

- `POST /admin/webhooks/` - Create webhook
- `PUT /admin/webhooks/{id}/` - Update webhook
- `DELETE /admin/webhooks/{id}/` - Delete webhook

**No GET endpoint exists.** Cannot retrieve webhooks independently.

## All Webhook Events (33 total)

### Site Events
- `site.changed` - Any content or settings modified

### Post Events
- `post.added` - New post created
- `post.deleted` - Post removed
- `post.edited` - Post modified
- `post.published` - Post goes live
- `post.published.edited` - Live post updated
- `post.unpublished` - Post taken offline
- `post.scheduled` - Post set for future publication
- `post.unscheduled` - Scheduled post removed from queue
- `post.rescheduled` - Scheduled post date changed

### Page Events
- `page.added` - New page created
- `page.deleted` - Page removed
- `page.edited` - Page modified
- `page.published` - Page goes live
- `page.published.edited` - Live page updated
- `page.unpublished` - Page taken offline
- `page.scheduled` - Page set for future publication
- `page.unscheduled` - Scheduled page removed from queue
- `page.rescheduled` - Scheduled page date changed

### Tag Events
- `tag.added` - New tag created
- `tag.edited` - Tag modified
- `tag.deleted` - Tag removed
- `post.tag.attached` - Tag linked to post
- `post.tag.detached` - Tag removed from post
- `page.tag.attached` - Tag linked to page
- `page.tag.detached` - Tag removed from page

### Member Events
- `member.added` - New member registered
- `member.edited` - Member information updated
- `member.deleted` - Member removed

## Webhook Create Payload

Required fields (inferred from API behavior):
- `event` - One of the events above
- `target_url` - URL to receive the webhook POST

Optional:
- `name` - Human-readable name
- `secret` - Shared secret for HMAC signature verification
- `api_version` - Target API version
- `integration_id` - Associated integration
