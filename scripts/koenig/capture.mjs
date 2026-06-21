// POST each card, read back Ghost's NORMALIZED stored lexical node, and dump
// all of them to normalized.json. Ghost's stored form is the canonical payload.
import crypto from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { cards } from './cards.mjs';

const env = Object.fromEntries(
    readFileSync(new URL('../../.env', import.meta.url), 'utf8')
        .split('\n')
        .filter((l) => l && !l.startsWith('#'))
        .map((l) => {
            const i = l.indexOf('=');
            return [l.slice(0, i), l.slice(i + 1)];
        }),
);
const URL_ = env.GHOST_URL;
const [id, secret] = env.GHOST_ADMIN_API_KEY.split(':');
function token() {
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const h = b64({ alg: 'HS256', typ: 'JWT', kid: id }),
        p = b64({ iat: now, exp: now + 300, aud: '/admin/' });
    const s = crypto
        .createHmac('sha256', Buffer.from(secret, 'hex'))
        .update(`${h}.${p}`)
        .digest('base64url');
    return `${h}.${p}.${s}`;
}
const hdr = () => ({
    Authorization: `Ghost ${token()}`,
    'Content-Type': 'application/json',
    'Accept-Version': 'v6.0',
});
const doc = (node) =>
    JSON.stringify({
        root: {
            type: 'root',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [node],
        },
    });

const out = {};
const ids = [];
for (const [name, node] of Object.entries(cards)) {
    const body = JSON.stringify({
        posts: [{ title: `[cap] ${name}`, status: 'draft', lexical: doc(node) }],
    });
    const r = await fetch(`${URL_}/ghost/api/admin/posts/?formats=lexical`, {
        method: 'POST',
        headers: hdr(),
        body,
    });
    const j = await r.json();
    if (r.status === 201) {
        out[name] = JSON.parse(j.posts[0].lexical).root.children[0];
        ids.push(j.posts[0].id);
    } else {
        out[name] = { ERROR: j.errors?.[0]?.message };
    }
}
for (const pid of ids) {
    await fetch(`${URL_}/ghost/api/admin/posts/${pid}/`, { method: 'DELETE', headers: hdr() });
}
writeFileSync(
    new URL('../../docs/koenig-cards.json', import.meta.url),
    JSON.stringify(out, null, 2),
);
console.log('Captured', Object.keys(out).length, 'normalized card nodes -> docs/koenig-cards.json');
