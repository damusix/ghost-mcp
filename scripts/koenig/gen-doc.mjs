// Generate docs/koenig-cards.md from the canonical (Ghost-normalized) payloads
// plus curated per-card notes. Every payload block is copied verbatim from
// docs/koenig-cards.json, which is what Ghost itself stored — guaranteed valid.
import { readFileSync, writeFileSync } from 'node:fs';
const n = JSON.parse(readFileSync(new URL('../../docs/koenig-cards.json', import.meta.url), 'utf8'));
const specs = JSON.parse(readFileSync(new URL('../../docs/koenig-node-specs.json', import.meta.url), 'utf8'));
// spec keyed by node type (e.g. extended-quote), card keyed by friendly name (e.g. quote)
const specFor = name => specs[n[name]?.type] || specs[name];

// group, web-render behavior, and field notes per card
const meta = {
  paragraph:       ['Text', 'web+email', 'Standard block. `children` are `extended-text`/`link` nodes. `format` is a bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript (combine by adding).'],
  heading:         ['Text', 'web+email', '`extended-heading`. `tag` is h1–h6. Renders an auto `id` slug.'],
  quote:           ['Text', 'web+email', '`extended-quote` (blockquote). Element node holding inline `extended-text`/`link` children directly.'],
  aside:           ['Text', 'web+email', 'Pull-quote / aside. Element node holding inline children; renders a styled `<aside>`.'],
  image:           ['Media', 'web+email', '`cardWidth`: regular | wide | full. `href` makes it a link. `width`/`height` drive srcset.'],
  gallery:         ['Media', 'web+email', '`images[]`: each `{fileName, row, src, width, height, title, alt}`. `row` groups images into rows (0-indexed).'],
  video:           ['Media', 'web+email', 'Needs `thumbnailSrc` for a poster. `loop`, `duration` (seconds), `cardWidth`.'],
  audio:           ['Media', 'web+email', '`title`, `duration` (seconds), `mimeType`, optional `thumbnailSrc`.'],
  file:            ['Media', 'web+email', '`fileTitle`, `fileCaption`, `fileName`, `fileSize` (bytes — Ghost formats it).'],
  bookmark:        ['Embed', 'web+email', 'Card content lives in the nested `metadata` object, NOT top-level. `url` + `metadata{url,title,description,icon,publisher,author,thumbnail}`.'],
  embed:           ['Embed', 'web+email', '`html` is the raw iframe/embed markup. `embedType`: video | rich | photo | link. `metadata` optional.'],
  html:            ['Embed', 'web+email', 'Raw HTML passthrough, wrapped in `<!--kg-card-begin/end: html-->`. Only `html` is required.'],
  markdown:        ['Embed', 'web+email', '`markdown` string, rendered server-side to HTML.'],
  codeblock:       ['Embed', 'web+email', '`code`, `language` (highlight.js name), `caption`.'],
  callout:         ['Layout', 'web+email', '`calloutText`, `calloutEmoji` (empty string = no emoji), `backgroundColor` (named: grey/white/blue/green/yellow/red/pink/purple/accent or hex).'],
  toggle:          ['Layout', 'web only', '`heading` + `content` (HTML string). Collapsible accordion; no-op in email.'],
  button:          ['Layout', 'web+email', '`buttonText`, `buttonUrl`, `alignment`: left | center.'],
  header:          ['Layout', 'web+email', 'version 2. Big hero. `size`, `layout` (regular/wide/full/split), colors as hex or "accent"/"transparent", `backgroundImageSrc`, optional button.'],
  'call-to-action':['Layout', 'web+email', '`textValue` is HTML. `layout`: minimal | immersive. `visibility` gates web/email segments. Optional image + button + sponsor label.'],
  signup:          ['Membership', 'web only', 'Member signup form. `labels[]` applied to new members. `buttonColor` accepts "accent" or hex. No-op in email.'],
  product:         ['Layout', 'web+email', 'All fields prefixed `product*`. `productRatingEnabled` + `productStarRating` (1–5). Optional button.'],
  horizontalrule:  ['Divider', 'web+email', 'Just `{type, version}`. Renders `<hr>`.'],
  paywall:         ['Membership', 'web+email', 'Just `{type, version}`. Splits free vs members-only content; renders `<!--members-only-->`.'],
  email:           ['Email-only', 'email only', 'Renders ONLY in newsletters (empty on web). `html` supports `{first_name, "fallback"}` replacement strings.'],
  'email-cta':     ['Email-only', 'email only', 'Newsletter CTA. `segment` (e.g. status:free) targets member tiers. Empty on web.'],
};

const groups = ['Text', 'Media', 'Embed', 'Layout', 'Membership', 'Divider', 'Email-only'];
let md = `# Koenig card payloads


Every Ghost 6 post stores its body as a **lexical** JSON tree in the \`lexical\`
field. Each Koenig editor feature is a node in that tree. To create content via
the Admin API, POST a post with a \`lexical\` string — Ghost renders the HTML.

Each card section has two parts: the **canonical payload** (the exact form Ghost
stored after a round-trip through the local Admin API — POST accepted 201, stored,
rendered) and the **full field/default table** extracted from the
\`@tryghost/kg-default-nodes\` source (\`docs/koenig-node-specs.json\`). The payload
shows a working example; the table shows every available field and its default.

Machine-readable companions: \`docs/koenig-cards.json\` (example payloads) and
\`docs/koenig-node-specs.json\` (full schema).


## Document envelope


A card node is placed in the root \`children\` array:

\`\`\`json
{ "root": { "type": "root", "version": 1, "direction": "ltr", "format": "", "indent": 0,
    "children": [ /* card nodes here */ ] } }
\`\`\`

POST it (admin JWT auth, \`Accept-Version: v6.0\`):

\`\`\`
POST /ghost/api/admin/posts/
{ "posts": [ { "title": "...", "status": "draft", "lexical": "<stringified root>" } ] }
\`\`\`

Pass the lexical tree as a **JSON string**, not a nested object.


## Card index


| Card | \`type\` | ver | Renders | \`visibility\` | Group |
|------|--------|-----|---------|------------|-------|
`;
for (const k of Object.keys(n)) {
  const [g, render] = meta[k];
  const vis = specFor(k)?.hasVisibility ? 'yes' : '—';
  md += `| ${k} | \`${n[k].type}\` | ${n[k].version} | ${render} | ${vis} | ${g} |\n`;
}

for (const g of groups) {
  const keys = Object.keys(n).filter(k => meta[k][0] === g);
  if (!keys.length) continue;
  md += `\n\n## ${g}\n`;
  for (const k of keys) {
    const [, render, note] = meta[k];
    const sp = specFor(k);
    md += `\n\n### ${k}\n\n${note}\n\n_Renders: ${render}._`;
    if (sp?.hasVisibility) md += ` Supports a \`visibility\` object (web/email member segments).`;
    md += `\n\n_Canonical payload (Ghost-stored):_\n\n\`\`\`json\n${JSON.stringify(n[k], null, 2)}\n\`\`\`\n`;
    const fields = sp && Object.keys(sp.fields || {}).length ? sp.fields : null;
    if (fields) {
      md += `\n_All fields and source defaults (\`kg-default-nodes\`):_\n\n`;
      md += '| field | default |\n|-------|---------|\n';
      for (const [f, d] of Object.entries(fields)) md += `| \`${f}\` | \`${JSON.stringify(d)}\` |\n`;
    }
  }
}

md += `\n\n## Notes


- **Colors**: named tokens (\`grey\`, \`blue\`, \`accent\`, ...) or hex. \`accent\` uses the site's accent color.
- **Visibility**: cards like \`call-to-action\` and \`html\` accept a \`visibility\` object to gate web/email and member segments.
- **Email-only cards** (\`email\`, \`email-cta\`) and \`toggle\`/\`signup\` produce no web card wrapper where noted — that is expected, not a failure.
- **Assets**: \`src\`/\`imageUrl\`/\`thumbnailSrc\` accept any URL. Upload to Ghost first (\`images.upload\`) for hosted assets, or reference external URLs.
- Regenerate this reference with \`scripts/koenig/\` against the local stack (see [experimentation.md](experimentation.md)).
`;

writeFileSync(new URL('../../docs/koenig-cards.md', import.meta.url), md);
console.log('wrote docs/koenig-cards.md (' + md.length + ' bytes)');
