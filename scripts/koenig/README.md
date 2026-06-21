# Koenig card harness


Scripts that derive and validate the canonical lexical payload for every Ghost
Koenig card by round-tripping through the local Ghost (see
[../../docs/experimentation.md](../../docs/experimentation.md) for the stack).

Output lives in [../../docs/koenig-cards.md](../../docs/koenig-cards.md) (reference)
and [../../docs/koenig-cards.json](../../docs/koenig-cards.json) (machine-readable).

Requires the stack up (`docker compose up -d`) and a local `.env`
(`bin/ghost-keys.sh --write`). All writes target the LOCAL Ghost only.


## Scripts


- `cards.mjs` — candidate payload for every card (the source of truth to edit).
- `roundtrip.mjs` — POST each card to the local Admin API; report accept/render status. Probes are deleted after.
- `capture.mjs` — POST each card, read back Ghost's normalized lexical, write `docs/koenig-cards.json`.
- `gen-doc.mjs` — regenerate `docs/koenig-cards.md` from the JSON + curated notes.
- `gallery.mjs` — publish one "Koenig Card Gallery" post containing every card for visual inspection.


## Regenerate


```bash
node scripts/koenig/capture.mjs    # refresh canonical JSON
node scripts/koenig/gen-doc.mjs    # refresh the markdown reference
node scripts/koenig/gallery.mjs    # rebuild the gallery post
```
