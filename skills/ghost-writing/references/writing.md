# Writing good posts

Block mechanics live in [blocks.md](blocks.md); this page is the craft — what makes a post worth reading and how to shape it with the blocks you have.

## One post, one goal

Before composing anything, answer: _what should the reader know or do after this post?_ If you have two answers, you have two posts. The goal decides the title, the structure, and the single CTA at the end.

## Structure

- **Hook first.** The opening paragraph earns the rest of the read: state the problem, the payoff, or the surprising claim. No throat-clearing ("In today's fast-paced world...").
- **Sections with `heading` level 2.** The post title is the h1 — body headings start at level 2, with level 3 for subsections. Never skip levels.
- **A heading every 3–6 paragraphs.** Readers scan before they read; headings are the scan path. A heading should make sense out of context.
- **End with a conclusion and one CTA.** Summarize the takeaway in a paragraph, then one `button`, `signup`, or `cta` — not all three.

## Rhythm and scannability

- Keep paragraphs to 2–4 sentences. A wall of `paragraph` blocks reads as work; break long chains with a `list`, `image`, `callout`, or `divider`.
- Use `list` whenever items are parallel — three comma-separated clauses in a sentence usually want to be bullets.
- Bold sparingly: **key terms** the scanner's eye should catch, not whole sentences.
- Make link text descriptive: `[the Koenig card reference](url)`, never `[click here](url)`.
- One `callout` per section at most. When everything is highlighted, nothing is.

## Metadata

Set these on every post — they control how the post looks in lists, search, and shares:

- **`title`** — under ~60 characters so it doesn't truncate in search results. Specific beats clever.
- **`excerpt`** — 1–2 sentences selling the post; shows in post lists and social cards. Don't let Ghost auto-truncate the first paragraph.
- **`tags`** — the first tag is the primary tag and drives theme layout/routing. Reuse existing tags (check `tags.browse`) before inventing new ones.
- **`feature_image`** — posts without one look broken in most themes' index pages. Upload via `images.upload` if needed.
- **`slug`** — short and stable; leave it derived from the title unless the title is long.
- **`meta_title` / `meta_description`** — only when the SEO framing should differ from the display title/excerpt (set via `use_ghost_api posts.edit`).

## Voice

- Plain, precise language. Name things what they are; cut adjectives that don't discriminate.
- Active voice, present tense where possible. "Ghost renders the card" over "the card is rendered".
- Concrete beats abstract: an example, a number, or a before/after every few paragraphs.
- Cut the last 10%: filler intros, hedges ("arguably", "quite"), and restating what the heading already said.

## Newsletter and member awareness

If the post goes out as a newsletter or sits behind membership, shape it for both renderings:

- `toggle` and `signup` do nothing in email; don't put essential content or the only CTA in them.
- `email` / `email-cta` blocks are invisible on web — use them for the personal greeting or subscriber-only pitch, never for the body.
- Place `paywall` after the hook and first real insight, so free readers get value and a reason to upgrade.
