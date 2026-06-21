// Build ONE published post containing every Koenig card, kept in local Ghost
// so the cards can be viewed rendered in the editor / front end.
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
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

const label = (txt) => ({
    type: 'extended-heading',
    version: 1,
    tag: 'h3',
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [
        {
            type: 'extended-text',
            version: 1,
            text: txt,
            format: 0,
            mode: 'normal',
            style: '',
            detail: 0,
        },
    ],
});

const order = [
    'heading',
    'paragraph',
    'quote',
    'aside',
    'image',
    'gallery',
    'video',
    'audio',
    'file',
    'bookmark',
    'embed',
    'html',
    'markdown',
    'codeblock',
    'callout',
    'toggle',
    'button',
    'header',
    'call-to-action',
    'signup',
    'product',
    'horizontalrule',
    'paywall',
    'email',
    'email-cta',
];
const children = [];
for (const name of order) {
    children.push(label(`▸ ${name}`));
    children.push(cards[name]);
}
const lexical = JSON.stringify({
    root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children },
});

// delete any prior gallery, then create fresh
const existing = await (
    await fetch(`${URL_}/ghost/api/admin/posts/slug/koenig-card-gallery/`, { headers: hdr() })
).json();
if (existing.posts?.[0]) {
    await fetch(`${URL_}/ghost/api/admin/posts/${existing.posts[0].id}/`, {
        method: 'DELETE',
        headers: hdr(),
    });
}

const body = JSON.stringify({
    posts: [
        { title: 'Koenig Card Gallery', slug: 'koenig-card-gallery', status: 'published', lexical },
    ],
});
const r = await fetch(`${URL_}/ghost/api/admin/posts/`, { method: 'POST', headers: hdr(), body });
const j = await r.json();
if (r.status === 201) {
    console.log('Created:', j.posts[0].url);
    console.log('Edit   :', `${URL_}/ghost/#/editor/post/${j.posts[0].id}`);
} else {
    console.log('FAILED', r.status, JSON.stringify(j.errors?.[0] || j).slice(0, 300));
}
