// Round-trip every candidate card through the local Ghost Admin API:
// POST a draft containing the card, read it back with rendered html + stored
// lexical, and report what Ghost accepted / normalized / rendered.
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { cards } from './cards.mjs';

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; })
);
const URL_ = env.GHOST_URL;
const [id, secret] = env.GHOST_ADMIN_API_KEY.split(':');

function token() {
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const h = b64({ alg: 'HS256', typ: 'JWT', kid: id });
  const p = b64({ iat: now, exp: now + 300, aud: '/admin/' });
  const s = crypto.createHmac('sha256', Buffer.from(secret, 'hex')).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${s}`;
}
const hdr = () => ({ Authorization: 'Ghost ' + token(), 'Content-Type': 'application/json', 'Accept-Version': 'v6.0' });

const doc = node => JSON.stringify({ root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [node] } });

async function roundtrip(name, node) {
  const body = JSON.stringify({ posts: [{ title: `[probe] ${name}`, status: 'draft', lexical: doc(node) }] });
  const post = await fetch(`${URL_}/ghost/api/admin/posts/?formats=html,lexical`, { method: 'POST', headers: hdr(), body });
  const j = await post.json();
  if (post.status !== 201) {
    return { name, ok: false, status: post.status, error: JSON.stringify(j.errors?.[0]?.context || j.errors?.[0]?.message || j).slice(0, 200) };
  }
  const p = j.posts[0];
  const stored = JSON.parse(p.lexical).root.children[0];
  const html = (p.html || '').replace(/\s+/g, ' ').trim();
  return { name, ok: true, status: 201, id: p.id, htmlLen: html.length, htmlSnippet: html.slice(0, 120), storedType: stored?.type, storedKeys: stored ? Object.keys(stored).join(',') : '(dropped)' };
}

const results = [];
for (const [name, node] of Object.entries(cards)) {
  try { results.push(await roundtrip(name, node)); }
  catch (e) { results.push({ name, ok: false, error: e.message }); }
}

// cleanup probe drafts
for (const r of results) {
  if (r.id) await fetch(`${URL_}/ghost/api/admin/posts/${r.id}/`, { method: 'DELETE', headers: hdr() });
}

console.log('CARD'.padEnd(18), 'ST', 'HTML', 'STORED TYPE'.padEnd(16), 'NOTES');
for (const r of results) {
  if (r.ok) {
    const renders = r.htmlLen > 0 ? `${r.htmlLen}b` : 'EMPTY';
    console.log(r.name.padEnd(18), '201', renders.padEnd(5).slice(0,5), (r.storedType || '—').padEnd(16), r.htmlSnippet || '');
  } else {
    console.log(r.name.padEnd(18), String(r.status || 'ERR').padEnd(3), '—    ', '—'.padEnd(16), 'FAIL: ' + r.error);
  }
}
const pass = results.filter(r => r.ok).length;
console.log(`\n${pass}/${results.length} accepted by Ghost (201).`);
