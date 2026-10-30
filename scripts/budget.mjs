#!/usr/bin/env node
// Performance budgets (#1320 B.5), read from the committed/fresh dists:
//   shell JS  = every script the home page loads up front (modulepreload + entry imports), gzip <= 60 kB
//   any other JS chunk (lazy app/section code)                                          gzip <= 40 kB each
//   CSS total                                                                           gzip <= 30 kB
//   icon sprite (when present)                                                          raw  <= 80 kB
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIMIT = { shell: 60 * 1024, chunk: 40 * 1024, css: 30 * 1024, sprite: 80 * 1024 };
const gz = (f) => gzipSync(readFileSync(f), { level: 9 }).length;
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const kb = (n) => (n / 1024).toFixed(1) + ' kB';
let bad = 0;
for (const site of ['cloudy-webapps', 'cloudy-c3']) {
  const dist = join(root, 'sites', site, 'dist');
  if (!existsSync(join(dist, 'index.html'))) { console.error(`FAIL ${site}: no dist/index.html (build first)`); bad++; continue; }
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  const base = /href="([^"]*?)\/_app\//.exec(html)?.[1] ?? '';
  const initial = new Set([...html.matchAll(/(?:href|import\()\s*"([^"]+\.js)"/g)].map((m) => m[1].replace(base + '/', '')));
  const files = walk(dist);
  let shell = 0;
  for (const rel of initial) { const f = join(dist, rel); if (existsSync(f)) shell += gz(f); }
  const css = files.filter((f) => f.endsWith('.css')).reduce((n, f) => n + gz(f), 0);
  const big = files.filter((f) => f.endsWith('.js') && f.includes('/_app/') && ![...initial].some((r) => f.endsWith(r))).map((f) => [f, gz(f)]).filter(([, n]) => n > LIMIT.chunk);
  const sprite = files.find((f) => f.endsWith('sprite.svg'));
  console.log(`${site}: shell JS ${kb(shell)} (${initial.size} files) / ${kb(LIMIT.shell)}, CSS ${kb(css)} / ${kb(LIMIT.css)}${sprite ? `, sprite ${kb(statSync(sprite).size)}` : ''}`);
  if (shell > LIMIT.shell) { console.error(`FAIL ${site}: shell JS over budget`); bad++; }
  if (css > LIMIT.css) { console.error(`FAIL ${site}: CSS over budget`); bad++; }
  for (const [f, n] of big) { console.error(`FAIL ${site}: chunk ${f.slice(dist.length)} ${kb(n)} > ${kb(LIMIT.chunk)}`); bad++; }
  if (sprite && statSync(sprite).size > LIMIT.sprite) { console.error(`FAIL ${site}: sprite over budget`); bad++; }
}
if (bad) process.exit(1);
console.log('ok: budgets');
