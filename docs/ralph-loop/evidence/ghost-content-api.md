# Ghost Content API - R&D Evidence

> Source: https://docs.ghost.org/content-api (fetched 2026-03-29)

## Authentication

- **Method**: API Key as query parameter `?key={key}`
- Safe for browser/public use - only provides access to published data
- Generated via Custom Integration in Ghost Admin > Settings > Integrations

## Base URL

```
https://{admin_domain}/ghost/api/content/
```

Headers:

- `Accept-Version: v{major}.{minor}`

## Endpoints

| Resource | Browse           | Read by ID           | Read by Slug                |
| -------- | ---------------- | -------------------- | --------------------------- |
| Posts    | `GET /posts/`    | `GET /posts/{id}/`   | `GET /posts/slug/{slug}/`   |
| Pages    | `GET /pages/`    | `GET /pages/{id}/`   | `GET /pages/slug/{slug}/`   |
| Authors  | `GET /authors/`  | `GET /authors/{id}/` | `GET /authors/slug/{slug}/` |
| Tags     | `GET /tags/`     | `GET /tags/{id}/`    | `GET /tags/slug/{slug}/`    |
| Tiers    | `GET /tiers/`    | -                    | -                           |
| Settings | `GET /settings/` | -                    | -                           |

**All endpoints are GET-only (read-only).**

## Post Object Fields

- `slug`, `id`, `uuid`, `comment_id`
- `title`, `html`, `excerpt`, `custom_excerpt`
- `feature_image`, `feature_image_alt`, `feature_image_caption`
- `og_image`, `og_title`, `og_description`
- `twitter_image`, `twitter_title`, `twitter_description`
- `meta_title`, `meta_description`
- `url`, `canonical_url`, `reading_time`
- `visibility`, `featured`, `access`
- `custom_template`, `codeinjection_head`, `codeinjection_foot`
- `email_subject`
- `created_at`, `updated_at`, `published_at`
- Include: `tags[]`, `authors[]`, `primary_author`, `primary_tag`

## Tag Object Fields

- `slug`, `id`, `name`, `description`
- `feature_image`, `visibility`
- `meta_title`, `meta_description`
- `og_image`, `og_title`, `og_description`
- `twitter_image`, `twitter_title`, `twitter_description`
- `codeinjection_head`, `codeinjection_foot`
- `canonical_url`, `accent_color`, `url`
- Include: `count.posts`

Note: Internal tags always included by default. Use `filter=visibility:public` to exclude.
Tags without associated posts aren't returned unless specifically included.

## Author Object Fields

- `slug`, `id`, `name`, `profile_image`, `cover_image`
- `bio`, `website`, `location`, `facebook`, `twitter`
- `meta_title`, `meta_description`, `url`
- Include: `count.posts`

## Query Parameters

| Parameter | Applies To   | Description                                                                                                                           |
| --------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `include` | All          | Comma-separated related data. Posts/Pages: `authors,tags`. Authors/Tags: `count.posts`. Tiers: `monthly_price,yearly_price,benefits`. |
| `fields`  | All          | Limit returned properties. Conflicts with `include`.                                                                                  |
| `formats` | Posts, Pages | `html` (default), `plaintext`. Syntax: `&formats=html,plaintext`                                                                      |
| `filter`  | Browse       | NQL filter expressions                                                                                                                |
| `limit`   | Browse       | Records per page. Default: 15. Max: 100.                                                                                              |
| `page`    | Browse       | Pagination offset                                                                                                                     |
| `order`   | Browse       | SQL-style sort. Posts default: `published_at DESC`. Pages/Tags/Authors: alphabetical. Tiers: lowest price.                            |

## NQL Filter Syntax

Format: `property:operator value`

### Operators

| Operator      | Meaning               |
| ------------- | --------------------- |
| `:`           | Equals                |
| `-`           | Not (negation prefix) |
| `>`           | Greater than          |
| `>=`          | Greater than or equal |
| `<`           | Less than             |
| `<=`          | Less than or equal    |
| `~`           | Contains              |
| `~^`          | Starts with           |
| `~$`          | Ends with             |
| `[val1,val2]` | In group              |

### Logical Operators

- `+` = AND
- `,` = OR
- `()` = Grouping/precedence

### Value Types

- Null/boolean: `null`, `true`, `false`
- Numbers: integers only
- Literals: unquoted strings (no whitespace)
- Strings: single-quoted for special chars
- Relative dates: `now-30d` (supports d, w, M, y, h, m, s)

### Examples

```
filter=featured:true
filter=tag:getting-started
filter=visibility:public
filter=created_at:>now-30d
filter=tag:-hash-internal+featured:true
```

## Pagination Response

```json
{
    "meta": {
        "pagination": {
            "page": 1,
            "limit": 15,
            "pages": 1,
            "total": 1,
            "next": null,
            "prev": null
        }
    }
}
```

## Key Notes

- Fully cacheable, unlimited request frequency
- JavaScript SDK available: `@tryghost/content-api`
- Posts don't include related data by default - must use `include`
- Admin domain may differ from site domain
