#!/usr/bin/env node
// Every route of the GENERATED routes.json is prerendered: sites/cloudy-webapps/dist/<path>/index.html exists (B.5), and the
// trailing-slash form is the canonical one (trailingSlash 'always' writes <path>/index.html, never <path>.html).
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'sites/cloudy-webapps/dist');
const { routes } = JSON.parse(readFileSync(join(root, 'packages/cloudy-ui/nav/routes.json'), 'utf8'));
const missing = routes.filter((r) => !existsSync(join(dist, r.path, 'index.html'))).map((r) => r.path || '/');
const flat = routes.filter((r) => r.path && existsSync(join(dist, r.path.replace(/\/$/, '') + '.html'))).map((r) => r.path);
for (const extra of ['t/index.html', '_gallery/index.html']) if (!existsSync(join(dist, extra))) missing.push(extra);
if (missing.length || flat.length) {
  if (missing.length) console.error(`FAIL ${missing.length} route(s) not prerendered: ${missing.slice(0, 10).join(', ')}`);
  if (flat.length) console.error(`FAIL ${flat.length} route(s) written without the trailing slash: ${flat.slice(0, 10).join(', ')}`);
  process.exit(1);
}
const sa = routes.filter((r) => ['home', 'section', 'page'].includes(r.kind)).length;
console.log(`ok: ${routes.length} routes prerendered (${sa} SuperApp, ${routes.length - sa} fleet app)`);

// The old replica's per-app pages (scripts/old-app-paths.txt, /cloud-superapp/apps/<id>/...) each resolve to a prerendered
// page of the new site: the same path under cloud-<id>/, else its nearest existing ancestor (the app root at worst).
import { oldAppTarget } from './lib/old-paths.mjs';
const have = new Set(routes.map((r) => r.path));
const old = readFileSync(join(root, 'scripts/old-app-paths.txt'), 'utf8').split('\n').filter(Boolean);
const lost = old.filter((p) => { const t = oldAppTarget(p, have); return t === null || !existsSync(join(dist, t, 'index.html')); });
if (lost.length) { console.error(`FAIL ${lost.length} old app page(s) resolve to nothing: ${lost.slice(0, 8).join(', ')}`); process.exit(1); }
console.log(`ok: ${old.length} old app pages resolve`);

// #1322: every phone-only app has a prerendered About page (the grey tile's target), each with its own direct URL.
const links = JSON.parse(readFileSync(join(root, 'packages/cloudy-ui/nav/app-links.json'), 'utf8')).links;
const aboutMissing = links.filter((l) => l.kind === 'phone-only' && !existsSync(join(dist, l.id, 'about', 'index.html'))).map((l) => `${l.id}/about/`);
if (aboutMissing.length) { console.error(`FAIL ${aboutMissing.length} About page(s) not prerendered: ${aboutMissing.slice(0, 10).join(', ')}`); process.exit(1); }
console.log(`ok: ${links.filter((l) => l.kind === 'phone-only').length} About pages prerendered`);
