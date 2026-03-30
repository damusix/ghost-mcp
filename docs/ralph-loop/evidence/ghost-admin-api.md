# Ghost Admin API - R&D Evidence

> Source: https://docs.ghost.org/admin-api (fetched 2026-03-29)

## Authentication

Three methods:

1. **Integration Token (JWT)** - Server-side. Admin API key generates short-lived JWTs.
   - Header: `Authorization: Ghost {token}`
   - JWT uses HS256 algorithm
   - Payload: `iat`, `exp` (max 5 min), audience `/admin/`
   - Key format: `{id}:{secret}` - the id becomes the JWT `kid`, secret is hex-encoded signing key

2. **Staff Access Token** - Personal tokens from user settings page
3. **User Authentication** - Session-based with email/password + optional 2FA

## Base URL

```
https://{admin_domain}/ghost/api/admin/
```

Headers:

- `Accept-Version: v{major}.{minor}`
- `Content-Type: application/json`

## Response Format

```json
{
  "resource_type": [{...}],
  "meta": {}
}
```

Resources always in arrays. Exceptions: `/site/` and `/settings/`.

## Endpoints Reference

| Resource        | Methods                                                                                                 | Notes                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/posts/`       | GET (browse), GET `/{id}/`, GET `/slug/{slug}/`, POST, PUT `/{id}/`, POST `/{id}/copy`, DELETE `/{id}/` | Primary content resource. Lexical JSON format. Use `?formats=html,lexical` for HTML.                                    |
| `/pages/`       | GET (browse), GET `/{id}/`, GET `/slug/{slug}/`, POST, PUT `/{id}/`, POST `/{id}/copy`, DELETE `/{id}/` | Static resources, same schema as posts.                                                                                 |
| `/tags/`        | GET (browse), GET `/{id}/`, POST, PUT `/{id}/`, DELETE `/{id}/`                                         | Organizational taxonomy.                                                                                                |
| `/tiers/`       | GET (browse), GET `/{id}/`, POST, PUT `/{id}/`                                                          | Membership pricing tiers. Include: `monthly_price`, `yearly_price`, `benefits`. Filter: `type`, `visibility`, `active`. |
| `/newsletters/` | GET (browse), GET `/{id}/`, POST, PUT `/{id}/`                                                          | Email distribution configuration.                                                                                       |
| `/offers/`      | GET (browse), GET `/{id}/`, POST, PUT `/{id}/`                                                          | Discount/promotional offers. Types: `percent` or `fixed`. Cadence: `month` or `year`.                                   |
| `/members/`     | GET (browse), GET `/{id}/`, POST, PUT `/{id}/`                                                          | Audience management. Include: `newsletters`, `labels`.                                                                  |
| `/users/`       | GET (browse), GET `/{id}/`                                                                              | Staff users (read-only). Include: `count.posts`, `permissions`, `roles`.                                                |
| `/images/`      | POST `/upload/`                                                                                         | Multipart form upload. Returns `{ images: [{ url, ref }] }`.                                                            |
| `/themes/`      | POST `/upload`, PUT `/{name}/activate`                                                                  | ZIP upload for themes. Returns theme object with `name`, `package`, `active`, `templates`.                              |
| `/webhooks/`    | POST, PUT `/{id}/`, DELETE `/{id}/`                                                                     | No GET endpoint. Cannot retrieve webhooks independently.                                                                |
| `/site/`        | GET                                                                                                     | Site metadata.                                                                                                          |

## Post/Page Object Fields

- **Content**: `lexical` (JSON), `html` (via formats param), `title`, `slug`, `excerpt`, `custom_excerpt`
- **Identity**: `id`, `uuid`, `comment_id`
- **Status**: `status` (draft/published/scheduled), `visibility`, `featured`
- **Images**: `feature_image`, `feature_image_alt`, `feature_image_caption`, `og_image`, `twitter_image`
- **SEO**: `meta_title`, `meta_description`, `og_title`, `og_description`, `twitter_title`, `twitter_description`, `canonical_url`
- **Code injection**: `codeinjection_head`, `codeinjection_foot`
- **Relations**: `tags[]`, `authors[]`, `primary_author`, `primary_tag`
- **Distribution**: `newsletter`, `email` objects
- **Timestamps**: `created_at`, `updated_at`, `published_at`
- **Template**: `custom_template`, `email_subject`

## Member Object Fields

- `id`, `uuid`, `email`, `name`, `note`, `geolocation`
- `labels[]`, `subscriptions[]`, `newsletters[]`
- `avatar_image`, `email_count`, `email_opened_count`, `email_open_rate`
- `status` (free/paid/comped)
- `created_at`, `updated_at`, `last_seen_at`

## Newsletter Object Fields

- `id`, `uuid`, `name`, `description`, `slug`
- `sender_name`, `sender_email`, `sender_reply_to`
- `status` (active/archived), `visibility`, `subscribe_on_signup`, `sort_order`
- `header_image`, `show_header_icon`, `show_header_title`, `show_header_name`
- `title_font_category`, `title_alignment`, `body_font_category`
- `show_feature_image`, `footer_content`, `show_badge`
- `created_at`, `updated_at`

## Offer Object Fields

- `id`, `name`, `code`, `display_title`, `display_description`
- `type` (percent/fixed), `cadence` (month/year), `amount`, `duration` (once/forever/repeating)
- `duration_in_months`, `currency_restriction`, `currency`, `status`, `redemption_count`
- `tier` (object: id, name)

## Tier Object Fields

- `id`, `name`, `description`, `slug`, `active`, `type` (free/paid)
- `welcome_page_url`, `visibility` (public/none)
- `monthly_price`, `yearly_price`, `currency`, `benefits[]`
- `stripe_prices`, `created_at`, `updated_at`

## User Object Fields

- `id`, `name`, `slug`, `email`, `profile_image`, `cover_image`
- `bio`, `website`, `location`, `facebook`, `twitter`
- `status`, `meta_title`, `meta_description`
- `accessibility`, `tour`, `roles[]`, `permissions[]`
- `count.posts`, `url`
- Notification prefs: `comment_notifications`, `free_member_signup_notification`, `paid_subscription_started_notification`, `paid_subscription_canceled_notification`, `mention_notifications`, `milestone_notifications`

## Theme Object Fields

- `name`, `package` (package.json contents), `active` (boolean)
- `templates[]` (each: `filename`, `name`, `for[]`, `slug`)

## Pagination

Default: 15 per page. Parameters: `page`, `limit`, `include`, `fields`, `filter`, `order`.
Response meta: `meta.pagination` with `page`, `limit`, `pages`, `total`, `next`, `prev`.

## Query Parameters (shared with Content API)

- `include` - comma-separated related data
- `fields` - limit returned properties
- `formats` - `html`, `lexical`, `plaintext` (posts/pages only)
- `filter` - NQL filter expressions
- `limit` - records per page (max varies)
- `page` - pagination offset
- `order` - SQL-style ordering
