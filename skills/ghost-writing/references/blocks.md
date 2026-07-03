# Koenig block catalog

Every block `compose_post` / `compose_lexical` accepts, grouped as `koenig_help` reports them. This page tells you **when to reach for each block**; run `koenig_help { "block": "<type>" }` for exact fields and a JSON example — never guess field names.

## Prose blocks

Native Lexical nodes. Their `text` (or `items`) accepts inline markdown: `**bold**`, `_italic_`, `` `code` ``, `[links](url)`.

| Block       | Purpose                                              | Reach for it when                                                                |
| ----------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| `paragraph` | A text paragraph                                     | The default. Most of every post should be paragraphs.                            |
| `heading`   | Section heading, `level` 1–6 (default 2)             | Starting a new section. Use level 2 for top sections — the post title is the h1. |
| `list`      | Bullet or numbered list (`style`: `bullet`/`number`) | 3+ parallel items; steps in order → `number`.                                    |
| `quote`     | Blockquote                                           | Quoting a person or source. Attribution goes in a following paragraph.           |
| `aside`     | Pull-quote / aside                                   | Restating your own key line for emphasis, or a tangential remark.                |

## Media cards

| Block     | Purpose                                            | Reach for it when                                                      |
| --------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| `image`   | Single image with caption, alt text, optional link | One illustrative image. Always set `alt`.                              |
| `gallery` | Grid of images (`images` array)                    | 3+ related photos that belong together; beats stacking `image` blocks. |
| `video`   | Video file (`src`, `thumbnailSrc` poster)          | Self-hosted video files. For YouTube/Vimeo use `embed` instead.        |
| `audio`   | Audio file with title                              | Podcast episodes, audio clips.                                         |
| `file`    | Downloadable file card                             | PDFs, zips — anything the reader should download.                      |

## Embed cards

| Block       | Purpose                                                            | Reach for it when                                                                       |
| ----------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `bookmark`  | Rich link preview (title, description, thumbnail)                  | Featuring a link as a visual card — recommended reading, source articles.               |
| `embed`     | External embed (YouTube, X/Twitter, etc.) via `url` + embed `html` | Third-party content with a player/widget.                                               |
| `codeblock` | Syntax-highlighted code block                                      | Any multi-line code. Set `language`. Inline code stays in paragraph backticks.          |
| `markdown`  | Markdown rendered as one opaque unit                               | Avoid for prose — it edits as one blob. Only for markdown-specific needs (e.g. tables). |
| `html`      | Raw HTML passthrough                                               | Last resort when no native block fits. Not granularly editable in Ghost.                |

## Layout cards

| Block     | Purpose                                                     | Reach for it when                                                                  |
| --------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `callout` | Highlighted box with emoji and background color             | Warnings, tips, key takeaways — content the reader must not skim past.             |
| `toggle`  | Collapsible accordion (`content` is HTML; no-op in email)   | FAQs, optional detail. Don't hide essential content in it.                         |
| `button`  | Call-to-action button                                       | The post's one primary action. More than ~2 buttons dilutes all of them.           |
| `header`  | Large hero header with optional background image and button | Big visual section break in landing-page-style posts. Regular posts use `heading`. |
| `cta`     | Call-to-action card with text, optional image and button    | A richer pitch than a bare `button` — sponsorships, product plugs.                 |
| `product` | Product card with image, star rating, and button            | Product recommendations and reviews.                                               |

## Membership cards

| Block     | Purpose                             | Reach for it when                                                                                  |
| --------- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `signup`  | Member signup form (no-op in email) | Converting anonymous readers — typically near the end, once.                                       |
| `paywall` | Free/paid split marker              | Everything after it is members-only. Place it after the hook so free readers get real value first. |

## Structure & email cards

| Block       | Purpose                                                                                  | Reach for it when                                                                     |
| ----------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `divider`   | Horizontal rule                                                                          | Scene change within a section. Between sections, a `heading` already breaks the page. |
| `email`     | Content shown ONLY in the email newsletter (`html`, supports `{first_name, "fallback"}`) | Personal newsletter greetings/postscripts. Invisible on web.                          |
| `email-cta` | Newsletter-only CTA targeting a member segment                                           | Upgrade pitches to free subscribers in the email version.                             |

## Choosing between similar blocks

- **`quote` vs `aside` vs `callout`** — someone else's words → `quote`; your own line, amplified → `aside`; must-see info with visual weight → `callout`.
- **`bookmark` vs `embed` vs `button`** — preview a link → `bookmark`; play third-party content inline → `embed`; ask the reader to act → `button`.
- **`heading` vs `header`** — document structure → `heading`; full-width visual hero → `header`.
- **prose blocks vs `markdown` vs `html`** — native blocks edit granularly in Ghost's editor; `markdown` and `html` become single opaque cards. Prefer native, always.
