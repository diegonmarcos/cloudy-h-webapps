#!/usr/bin/env node
// test-old-urls.mjs (#1320 M7): every old URL (scripts/old-urls.txt) maps to a page the new dists actually serve, and
// gen-redirects.mjs writes a stub for every one of them into an empty deploy dir. Run after `npm run build`.
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { oldUrlTarget } from './lib/old-paths.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = new Set(JSON.parse(readFileSync(join(root, 'packages/cloudy-ui/nav/routes.json'), 'utf8')).routes.map((r) => r.path));
const urls = readFileSync(join(root, 'scripts/old-urls.txt'), 'utf8').split('\n').filter((l) => l.startsWith('/'));
/** a new absolute path -> the dist file Pages would serve for it */
const served = (p) => {
  let m;
  if ((m = /^\/cloudy-c3\/(.*)$/.exec(p))) return join(root, 'sites/cloudy-c3/dist', m[1], 'index.html');
  if ((m = /^\/cloud-webapps\/(.*)$/.exec(p))) {
    const svc = join(root, 'services', m[1].split('/')[0], 'dist/index.html');
    return m[1] && existsSync(svc) ? svc : join(root, 'sites/cloudy-webapps/dist', m[1], 'index.html');
  }
  return null;
};
const bad = [];
for (const u of urls) {
  const to = oldUrlTarget(u, routes);
  const f = to && served(to.split(/[?#]/)[0]);
  if (!f || !existsSync(f)) bad.push(`${u} -> ${to ?? '(no target)'}`);
}
if (urls.length < 350) bad.push(`old-urls.txt has only ${urls.length} URLs`);
// the stubs: an empty deploy dir gets one per old URL (bar those whose target is the same URL)
const site = mkdtempSync(join(tmpdir(), 'old-urls-'));
try {
  try { execFileSync('node', [join(root, 'scripts/gen-redirects.mjs'), site], { stdio: ['ignore', 'ignore', 'pipe'] }); } catch (e) { bad.push(`gen-redirects failed: ${String(e.stderr).split('\n').find((l) => l.startsWith('Error')) ?? e.message}`); }
  for (const u of urls) {
    if (oldUrlTarget(u, routes) === u) continue;
    if (!existsSync(join(site, u.endsWith('/') ? `${u}index.html` : u))) bad.push(`no stub for ${u}`);
  }
} finally { rmSync(site, { recursive: true, force: true }); }
if (bad.length) { console.error(`test-old-urls: ${bad.length} FAIL\n  ${bad.slice(0, 40).join('\n  ')}`); process.exit(1); }
console.log(`test-old-urls: ok, ${urls.length} old URLs land on a served page`);
