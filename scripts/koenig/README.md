# Koenig card harness


Scripts that derive and validate the canonical lexical payload for every Ghost
Koenig card by round-tripping through the local Ghost (see
[../../docs/experimentation.md](../../docs/experimentation.md) for the stack).

Outputs:

- [../../docs/koenig-cards.md](../../docs/koenig-cards.md) — human reference (payload + field table per card).
- [../../docs/koenig-cards.json](../../docs/koenig-cards.json) — canonical example payloads (Ghost-normalized).
- [../../docs/koenig-node-specs.json](../../docs/koenig-node-specs.json) — full field/default/visibility schema from the Koenig source.

Requires the stack up (`docker compose up -d`) and a local `.env`
(`bin/ghost-keys.sh --write`). All writes target the LOCAL Ghost only.

`extract-specs.mjs` additionally needs the Koenig source cloned (throwaway):

```bash
git clone --depth 1 https://github.com/TryGhost/Koenig.git tmp/koenig-repo
```


## Scripts


- `cards.mjs` — candidate payload for every card (the source of truth to edit).
- `roundtrip.mjs` — POST each card to the local Admin API; report accept/render status. Probes are deleted after.
- `capture.mjs` — POST each card, read back Ghost's normalized lexical, write `docs/koenig-cards.json`.
- `extract-specs.mjs` — parse `@tryghost/kg-default-nodes` source → `docs/koenig-node-specs.json` (every field + default + visibility).
- `gen-doc.mjs` — regenerate `docs/koenig-cards.md` from the canonical payloads + specs + curated notes.
- `gallery.mjs` — publish one "Koenig Card Gallery" post containing every card for visual inspection.


## Regenerate


```bash
node scripts/koenig/extract-specs.mjs   # refresh schema from cloned Koenig source
node scripts/koenig/capture.mjs         # refresh canonical payloads from local Ghost
node scripts/koenig/gen-doc.mjs         # refresh the markdown reference
node scripts/koenig/gallery.mjs         # rebuild the gallery post
```
