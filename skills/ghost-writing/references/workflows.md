# Tool map and workflows

## Which tool when

| Tool              | Use it for                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| `koenig_help`     | Discover block types, or fields + JSON example for one block. Call before composing.                   |
| `compose_post`    | Create or update a post from blocks. The default write path — never hand-write `lexical` or push HTML. |
| `compose_lexical` | Compile blocks to Lexical JSON _without_ touching the site — validate a `blockFile`, or preview.       |
| `use_ghost_api`   | Everything else: publish/schedule, tags, images, members, newsletters, settings.                       |
| `ghost_api_help`  | List available actions, or the payload schema for one (`{ "action": "posts.edit" }`).                  |
| `ghost_docs`      | Search Ghost's official docs (`{ "search": "..." }`) for platform questions the tools don't answer.    |

The server runs in **admin** mode (full read/write) or **content** mode (read-only). In content mode every write is rejected — surface that to the user instead of retrying.

## Create a post

1. `koenig_help` — refresh the block list if unsure.
2. Build the `blocks` array ([blocks.md](blocks.md)), following [writing.md](writing.md).
3. `compose_post { "title": ..., "status": "draft", "blocks": [...], "excerpt": ..., "tags": [{ "name": ... }] }`.
4. Report the returned post `url` and `id` so the user can review the draft.

Stay in `draft` until the user asks to publish. `visibility` controls access: `public`, `members`, `paid`, or `tiers`.

## Long posts: `blockFile`

For posts beyond ~15 blocks, don't inline the array — write it to a file and iterate there:

1. Write the blocks JSON (bare `[...]` or `{ "blocks": [...] }`) to an **absolute** path, e.g. under the project's `tmp/`.
2. Validate: `compose_lexical { "blockFile": "/abs/path/tmp/post.json" }` — composition errors list the offending block index.
3. Create: `compose_post { "title": ..., "status": "draft", "blockFile": "/abs/path/tmp/post.json" }`.
4. To revise, edit the file and re-run — the file is the source of truth; you never re-send the array.

## Edit an existing post

`compose_post` with an `id` **replaces the entire body** — there is no partial patch:

1. `use_ghost_api { "action": "posts.read", "payload": { "id": ..., "formats": "lexical" } }` — get current content and `updated_at`.
2. Rebuild the full blocks array (from your blockFile if you authored the post; otherwise reconstruct from the fetched content).
3. `compose_post { "id": ..., "updated_at": "<current value>", "blocks": [...] }` — a stale `updated_at` is rejected as a collision; re-read and retry.

For metadata-only changes (title, tags, status, feature image) skip composition and call `posts.edit` directly with `id` + `updated_at`.

## Publish or schedule

- Publish now: `posts.edit` with `{ "status": "published" }`.
- Schedule: `posts.edit` with `{ "status": "scheduled", "published_at": "<future ISO 8601>" }`.
- Both need `id` + current `updated_at`. Confirm with the user before either — publishing can trigger the newsletter send.

## Images

Ghost only renders images it can reach by URL:

1. Local file → `images.upload` (multipart upload) → returns the hosted URL.
2. Use that URL in `image` / `gallery` blocks or as `feature_image`.
3. External URLs work directly but break if the host removes them — prefer uploading.

## Newsletter posts

- Email-specific content: `email` and `email-cta` blocks ([blocks.md](blocks.md) — email-only group).
- Audience and sending are controlled at publish time by newsletter settings, not by blocks; check `newsletters.browse` for what exists and `ghost_docs { "search": "newsletter" }` for sending mechanics.
- Members-only content: `paywall` block for in-post splits, `visibility` for whole-post gating.

## When something fails

- Composition errors from `compose_post`/`compose_lexical` return `issues` with block indexes — fix the named block, don't fall back to `html`.
- API errors come back verbatim from Ghost; `ghost_api_help { "action": ... }` shows the expected payload shape.
- Unknown platform behavior (routing, themes, member tiers): `ghost_docs` before guessing.
