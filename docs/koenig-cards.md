# Koenig card payloads


Every Ghost 6 post stores its body as a **lexical** JSON tree in the `lexical`
field. Each Koenig editor feature is a node in that tree. To create content via
the Admin API, POST a post with a `lexical` string — Ghost renders the HTML.

Every payload below is the **canonical form Ghost itself stored** after a
round-trip through the local Admin API (see `docs/koenig-cards.json` for the
machine-readable set). All 23 node types were verified: POST accepted (201),
stored, and rendered. Field names map 1:1 to the renderers in
`ghost/core/core/server/services/koenig/node-renderers/`.


## Document envelope


A card node is placed in the root `children` array:

```json
{ "root": { "type": "root", "version": 1, "direction": "ltr", "format": "", "indent": 0,
    "children": [ /* card nodes here */ ] } }
```

POST it (admin JWT auth, `Accept-Version: v6.0`):

```
POST /ghost/api/admin/posts/
{ "posts": [ { "title": "...", "status": "draft", "lexical": "<stringified root>" } ] }
```

Pass the lexical tree as a **JSON string**, not a nested object.


## Card index


| Card | `type` | ver | Renders | Group |
|------|--------|-----|---------|-------|
| paragraph | `paragraph` | 1 | web+email | Text |
| heading | `extended-heading` | 1 | web+email | Text |
| image | `image` | 1 | web+email | Media |
| gallery | `gallery` | 1 | web+email | Media |
| video | `video` | 1 | web+email | Media |
| audio | `audio` | 1 | web+email | Media |
| file | `file` | 1 | web+email | Media |
| bookmark | `bookmark` | 1 | web+email | Embed |
| embed | `embed` | 1 | web+email | Embed |
| html | `html` | 1 | web+email | Embed |
| markdown | `markdown` | 1 | web+email | Embed |
| codeblock | `codeblock` | 1 | web+email | Embed |
| callout | `callout` | 1 | web+email | Layout |
| toggle | `toggle` | 1 | web only | Layout |
| button | `button` | 1 | web+email | Layout |
| header | `header` | 2 | web+email | Layout |
| call-to-action | `call-to-action` | 1 | web+email | Layout |
| signup | `signup` | 1 | web only | Membership |
| product | `product` | 1 | web+email | Layout |
| horizontalrule | `horizontalrule` | 1 | web+email | Divider |
| paywall | `paywall` | 1 | web+email | Membership |
| email | `email` | 1 | email only | Email-only |
| email-cta | `email-cta` | 1 | email only | Email-only |


## Text


### paragraph

Standard block. `children` are `extended-text`/`link` nodes. `format` is a bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript (combine by adding).

_Renders: web+email._

```json
{
  "type": "paragraph",
  "version": 1,
  "direction": "ltr",
  "format": "",
  "indent": 0,
  "children": [
    {
      "type": "extended-text",
      "version": 1,
      "text": "Plain paragraph with ",
      "format": 0,
      "mode": "normal",
      "style": "",
      "detail": 0
    },
    {
      "type": "extended-text",
      "version": 1,
      "text": "bold",
      "format": 1,
      "mode": "normal",
      "style": "",
      "detail": 0
    },
    {
      "type": "extended-text",
      "version": 1,
      "text": " and ",
      "format": 0,
      "mode": "normal",
      "style": "",
      "detail": 0
    },
    {
      "type": "link",
      "version": 1,
      "direction": "ltr",
      "format": "",
      "indent": 0,
      "rel": null,
      "target": null,
      "title": null,
      "url": "https://ghost.org",
      "children": [
        {
          "type": "extended-text",
          "version": 1,
          "text": "a link",
          "format": 0,
          "mode": "normal",
          "style": "",
          "detail": 0
        }
      ]
    }
  ]
}
```


### heading

`extended-heading`. `tag` is h1–h6. Renders an auto `id` slug.

_Renders: web+email._

```json
{
  "type": "extended-heading",
  "version": 1,
  "tag": "h2",
  "direction": "ltr",
  "format": "",
  "indent": 0,
  "children": [
    {
      "type": "extended-text",
      "version": 1,
      "text": "A Heading",
      "format": 0,
      "mode": "normal",
      "style": "",
      "detail": 0
    }
  ]
}
```


## Media


### image

`cardWidth`: regular | wide | full. `href` makes it a link. `width`/`height` drive srcset.

_Renders: web+email._

```json
{
  "type": "image",
  "version": 1,
  "src": "https://static.ghost.org/v5.0.0/images/publishing-options.png",
  "width": 1600,
  "height": 900,
  "title": "",
  "alt": "Demo image",
  "caption": "An image caption",
  "cardWidth": "regular",
  "href": ""
}
```


### gallery

`images[]`: each `{fileName, row, src, width, height, title, alt}`. `row` groups images into rows (0-indexed).

_Renders: web+email._

```json
{
  "type": "gallery",
  "version": 1,
  "caption": "A two-image gallery",
  "images": [
    {
      "fileName": "a.png",
      "row": 0,
      "src": "https://static.ghost.org/v5.0.0/images/publishing-options.png",
      "width": 1600,
      "height": 900,
      "title": "",
      "alt": ""
    },
    {
      "fileName": "b.png",
      "row": 0,
      "src": "https://static.ghost.org/v5.0.0/images/twitter.png",
      "width": 1000,
      "height": 500,
      "title": "",
      "alt": ""
    }
  ]
}
```


### video

Needs `thumbnailSrc` for a poster. `loop`, `duration` (seconds), `cardWidth`.

_Renders: web+email._

```json
{
  "type": "video",
  "version": 1,
  "src": "https://static.ghost.org/v4.0.0/videos/ghost-orb-white-hd.mp4",
  "caption": "A video",
  "cardWidth": "regular",
  "width": 1920,
  "height": 1080,
  "loop": false,
  "thumbnailSrc": "https://static.ghost.org/v5.0.0/images/twitter.png",
  "customThumbnailSrc": "",
  "duration": 12
}
```


### audio

`title`, `duration` (seconds), `mimeType`, optional `thumbnailSrc`.

_Renders: web+email._

```json
{
  "type": "audio",
  "version": 1,
  "src": "https://static.ghost.org/sample.mp3",
  "title": "An audio file",
  "duration": 30,
  "mimeType": "audio/mp3",
  "thumbnailSrc": "https://static.ghost.org/v5.0.0/images/twitter.png"
}
```


### file

`fileTitle`, `fileCaption`, `fileName`, `fileSize` (bytes — Ghost formats it).

_Renders: web+email._

```json
{
  "type": "file",
  "version": 1,
  "src": "https://static.ghost.org/sample.pdf",
  "fileTitle": "Whitepaper",
  "fileCaption": "Download our guide",
  "fileName": "guide.pdf",
  "fileSize": 24567
}
```


## Embed


### bookmark

Card content lives in the nested `metadata` object, NOT top-level. `url` + `metadata{url,title,description,icon,publisher,author,thumbnail}`.

_Renders: web+email._

```json
{
  "type": "bookmark",
  "version": 1,
  "url": "https://ghost.org",
  "caption": "",
  "metadata": {
    "url": "https://ghost.org",
    "title": "Ghost",
    "description": "The best open source blog & newsletter platform",
    "icon": "https://ghost.org/favicon.ico",
    "publisher": "Ghost",
    "author": null,
    "thumbnail": "https://static.ghost.org/v5.0.0/images/twitter.png"
  }
}
```


### embed

`html` is the raw iframe/embed markup. `embedType`: video | rich | photo | link. `metadata` optional.

_Renders: web+email._

```json
{
  "type": "embed",
  "version": 1,
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "embedType": "video",
  "html": "<iframe width=\"200\" height=\"113\" src=\"https://www.youtube.com/embed/dQw4w9WgXcQ\"></iframe>",
  "metadata": {
    "title": "Video"
  },
  "caption": "An embed"
}
```


### html

Raw HTML passthrough, wrapped in `<!--kg-card-begin/end: html-->`. Only `html` is required.

_Renders: web+email._

```json
{
  "type": "html",
  "version": 1,
  "html": "<div class=\"custom\">Raw <strong>HTML</strong> block</div>"
}
```


### markdown

`markdown` string, rendered server-side to HTML.

_Renders: web+email._

```json
{
  "type": "markdown",
  "version": 1,
  "markdown": "## Markdown card\n\nSupports **markdown** and lists:\n\n- one\n- two"
}
```


### codeblock

`code`, `language` (highlight.js name), `caption`.

_Renders: web+email._

```json
{
  "type": "codeblock",
  "version": 1,
  "code": "const x = 1;\nconsole.log(x);",
  "language": "javascript",
  "caption": "A code snippet"
}
```


## Layout


### callout

`calloutText`, `calloutEmoji` (empty string = no emoji), `backgroundColor` (named: grey/white/blue/green/yellow/red/pink/purple/accent or hex).

_Renders: web+email._

```json
{
  "type": "callout",
  "version": 1,
  "calloutText": "This is a callout with an emoji.",
  "calloutEmoji": "💡",
  "backgroundColor": "blue"
}
```


### toggle

`heading` + `content` (HTML string). Collapsible accordion; no-op in email.

_Renders: web only._

```json
{
  "type": "toggle",
  "version": 1,
  "heading": "Click to expand",
  "content": "<p>Hidden content revealed on toggle.</p>"
}
```


### button

`buttonText`, `buttonUrl`, `alignment`: left | center.

_Renders: web+email._

```json
{
  "type": "button",
  "version": 1,
  "buttonText": "Subscribe now",
  "buttonUrl": "https://example.com",
  "alignment": "center"
}
```


### header

version 2. Big hero. `size`, `layout` (regular/wide/full/split), colors as hex or "accent"/"transparent", `backgroundImageSrc`, optional button.

_Renders: web+email._

```json
{
  "type": "header",
  "version": 2,
  "size": "small",
  "style": "image",
  "buttonEnabled": true,
  "buttonText": "Get started",
  "buttonUrl": "https://example.com",
  "header": "Big Header",
  "subheader": "A compelling subheader",
  "alignment": "center",
  "backgroundColor": "#000000",
  "backgroundImageSrc": "https://static.ghost.org/v5.0.0/images/publishing-options.png",
  "backgroundImageWidth": 1600,
  "backgroundImageHeight": 900,
  "backgroundSize": "cover",
  "textColor": "#FFFFFF",
  "buttonColor": "#ffffff",
  "buttonTextColor": "#000000",
  "layout": "full",
  "swapped": false,
  "accentColor": "#FF0095"
}
```


### call-to-action

`textValue` is HTML. `layout`: minimal | immersive. `visibility` gates web/email segments. Optional image + button + sponsor label.

_Renders: web+email._

```json
{
  "type": "call-to-action",
  "version": 1,
  "layout": "minimal",
  "textValue": "<p>This is a call to action.</p>",
  "showButton": true,
  "buttonText": "Act now",
  "buttonUrl": "https://example.com",
  "buttonColor": "#000000",
  "buttonTextColor": "#ffffff",
  "hasSponsorLabel": true,
  "sponsorLabel": "<p>SPONSORED</p>",
  "backgroundColor": "grey",
  "alignment": "left",
  "imageUrl": "https://static.ghost.org/v5.0.0/images/publishing-options.png",
  "imageWidth": 1600,
  "imageHeight": 900,
  "linkColor": "text",
  "showDividers": true,
  "visibility": {
    "web": {
      "nonMember": true,
      "freeMember": true,
      "paidMember": true
    },
    "email": {
      "memberSegment": "status:free,status:-free"
    }
  }
}
```


### product

All fields prefixed `product*`. `productRatingEnabled` + `productStarRating` (1–5). Optional button.

_Renders: web+email._

```json
{
  "type": "product",
  "version": 1,
  "productImageSrc": "https://static.ghost.org/v5.0.0/images/publishing-options.png",
  "productImageWidth": 1600,
  "productImageHeight": 900,
  "productTitle": "The Product",
  "productDescription": "A great product you should buy.",
  "productRatingEnabled": true,
  "productStarRating": 5,
  "productButtonEnabled": true,
  "productButton": "Buy now",
  "productUrl": "https://example.com"
}
```


## Membership


### signup

Member signup form. `labels[]` applied to new members. `buttonColor` accepts "accent" or hex. No-op in email.

_Renders: web only._

```json
{
  "type": "signup",
  "version": 1,
  "alignment": "left",
  "backgroundColor": "#F0F0F0",
  "backgroundImageSrc": "",
  "backgroundSize": "cover",
  "buttonColor": "accent",
  "buttonText": "Subscribe",
  "buttonTextColor": "#FFFFFF",
  "disclaimer": "No spam. Unsubscribe anytime.",
  "header": "Sign up for our newsletter",
  "labels": [
    "From signup card"
  ],
  "layout": "wide",
  "subheader": "Join the community",
  "successMessage": "Check your inbox!",
  "textColor": "#000000",
  "swapped": false
}
```


### paywall

Just `{type, version}`. Splits free vs members-only content; renders `<!--members-only-->`.

_Renders: web+email._

```json
{
  "type": "paywall",
  "version": 1
}
```


## Divider


### horizontalrule

Just `{type, version}`. Renders `<hr>`.

_Renders: web+email._

```json
{
  "type": "horizontalrule",
  "version": 1
}
```


## Email-only


### email

Renders ONLY in newsletters (empty on web). `html` supports `{first_name, "fallback"}` replacement strings.

_Renders: email only._

```json
{
  "type": "email",
  "version": 1,
  "html": "<p>Hello {first_name, \"there\"}, this only shows in the email.</p>"
}
```


### email-cta

Newsletter CTA. `segment` (e.g. status:free) targets member tiers. Empty on web.

_Renders: email only._

```json
{
  "type": "email-cta",
  "version": 1,
  "alignment": "left",
  "buttonText": "Read more",
  "buttonUrl": "https://example.com",
  "html": "<p>Email-only CTA text.</p>",
  "segment": "status:free",
  "showButton": true,
  "showDividers": true
}
```


## Notes


- **Colors**: named tokens (`grey`, `blue`, `accent`, ...) or hex. `accent` uses the site's accent color.
- **Visibility**: cards like `call-to-action` and `html` accept a `visibility` object to gate web/email and member segments.
- **Email-only cards** (`email`, `email-cta`) and `toggle`/`signup` produce no web card wrapper where noted — that is expected, not a failure.
- **Assets**: `src`/`imageUrl`/`thumbnailSrc` accept any URL. Upload to Ghost first (`images.upload`) for hosted assets, or reference external URLs.
- Regenerate this reference with `tmp/koenig/` scripts against the local stack (see [experimentation.md](experimentation.md)).
