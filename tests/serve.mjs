#!/usr/bin/env node
// CI-only static server that lays the committed dists out exactly as GitHub Pages publishes them:
//   /cloud-webapps/<slug>/  -> services/<slug>/dist   (service fallback pages win, as on Pages)
//   /cloud-webapps/...      -> sites/cloudy-webapps/dist
//   /cloudy-c3/...          -> sites/cloudy-c3/dist
// Unknown paths get the matching site's 404.html with status 404. Never run locally (owner rule: CI builds only).
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.txt': 'text/plain' };
const MOUNTS = [
  ['/cloud-webapps/', (rest) => { const slug = rest.split('/')[0]; const d = join(root, 'services', slug, 'dist'); return slug && existsSync(d) ? [d, rest.slice(slug.length + 1)] : null; }],
  ['/cloud-webapps/', (rest) => [join(root, 'sites/cloudy-webapps/dist'), rest]],
  ['/cloudy-c3/', (rest) => [join(root, 'sites/cloudy-c3/dist'), rest]],
];
function resolveFile(dir, rest) {
  const p = normalize(join(dir, decodeURIComponent(rest)));
  if (!p.startsWith(dir)) return null;
  if (existsSync(p) && statSync(p).isFile()) return p;
  if (existsSync(join(p, 'index.html'))) return join(p, 'index.html');
  return null;
}
createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let path = url.pathname;
  if (path === '/cloud-webapps' || path === '/cloudy-c3') { res.writeHead(301, { location: path + '/' + url.search }); return res.end(); }
  for (const [prefix, map] of MOUNTS) {
    if (!path.startsWith(prefix)) continue;
    const m = map(path.slice(prefix.length));
    if (!m) continue;
    const [dir, rest] = m;
    const f = resolveFile(dir, rest);
    if (f) {
      // a directory URL without its trailing slash redirects, as Pages does
      if (f.endsWith('index.html') && !path.endsWith('/') && !rest.endsWith('index.html')) { res.writeHead(301, { location: path + '/' + url.search }); return res.end(); }
      res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
      return res.end(readFileSync(f));
    }
    if (dir.includes('services')) continue;
    const nf = join(dir, '404.html');
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    return res.end(existsSync(nf) ? readFileSync(nf) : 'not found');
  }
  res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found');
}).listen(port, () => console.log(`serving dists on http://127.0.0.1:${port}`));
