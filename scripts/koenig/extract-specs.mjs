// Extract the authoritative node schema (fields, defaults, visibility support)
// from a local clone of the Koenig source, writing docs/koenig-node-specs.json.
//
// Requires the Koenig repo cloned at tmp/koenig-repo (throwaway):
//   git clone --depth 1 https://github.com/TryGhost/Koenig.git tmp/koenig-repo
//
// This complements docs/koenig-cards.json (example payloads) with the complete
// optional-field set + defaults straight from each *Node.ts `properties` array.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../tmp/koenig-repo/packages/kg-default-nodes/src/nodes', import.meta.url).pathname;

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p;
  }).filter(p => p.endsWith('Node.ts'));
}

const specs = {};
for (const file of walk(ROOT)) {
  const src = readFileSync(file, 'utf8');
  const nodeType = src.match(/nodeType:\s*'([^']+)'/)?.[1]
    || src.match(/static getType\(\)\s*\{\s*return '([^']+)'/)?.[1]
    || src.match(/json\.type = '([^']+)'/)?.[1];
  if (!nodeType) continue;
  const hasVisibility = /hasVisibility:\s*true/.test(src);
  // {name: 'x', default: <expr>, ...} — capture name + default expression
  const fields = {};
  const re = /\{name:\s*'([^']+)',\s*default:\s*([^\n]+?)(?:,\s*(?:wordCount|urlType|urlPath|urlTransformMap)\b[^\n]*)?\}/g;
  let m;
  for (const line of src.split('\n')) {
    const fm = line.match(/\{name:\s*'([^']+)',\s*default:\s*(.+?)(?:,\s*(?:wordCount|urlType|urlPath|urlTransformMap):.*)?\}[,\s]*$/);
    if (fm) {
      let def = fm[2].trim().replace(/\s+as\s+.*$/, '').trim();
      if (def.startsWith("'")) def = def.replace(/^'|'$/g, '');
      else if (def === 'true') def = true;
      else if (def === 'false') def = false;
      else if (def === 'null') def = null;
      else if (/^-?\d+$/.test(def)) def = Number(def);
      fields[fm[1]] = def;
    }
  }
  specs[nodeType] = { nodeType, hasVisibility, fields };
}

// element/text nodes (no decorator properties) — note their tree shape
const elementNodes = {
  'extended-quote': { kind: 'element', note: 'blockquote; holds inline children (extended-text/link)' },
  aside: { kind: 'element', note: 'pull-quote/aside; holds inline children' },
  'extended-heading': { kind: 'element', note: 'heading h1–h6 via `tag`; holds inline children' },
  paragraph: { kind: 'element', note: 'standard block; holds inline children' },
};
for (const [t, v] of Object.entries(elementNodes)) specs[t] = { nodeType: t, hasVisibility: false, fields: {}, ...v };

writeFileSync(new URL('../../docs/koenig-node-specs.json', import.meta.url), JSON.stringify(specs, null, 2));
const decorator = Object.values(specs).filter(s => Object.keys(s.fields).length).length;
console.log(`wrote docs/koenig-node-specs.json — ${Object.keys(specs).length} node types (${decorator} with decorator fields)`);
