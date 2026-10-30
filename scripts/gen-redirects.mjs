#!/usr/bin/env node
// Writes redirect stubs for URLs that moved, into the deploy dir (arg 1, default _site) (#1320 M7):
//   every old URL in scripts/old-urls.txt (the /cloud-superapp/ replica, /cloud/ C3 portal, /cloud-web/, the old per-app
//   stub folders, /cloud-mobile/) -> its new page (scripts/lib/old-paths.mjs), query + hash kept so ?embed=1 survives;
//   /c__Cloud/, /c__Cloud/<group>/, /c__Cloud/<group>/<app>/ -> /cloud-webapps/[<app>/].
// A stub never replaces a page the deploy already has (until the cut-over the old sites still publish theirs), except
// FORCE: the two the APK's history depends on, and the /cloud-web/ grid (its Wasm pages under /cloud-web/apps/ stay).
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { oldUrlTarget } from './lib/old-paths.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = process.argv[2] ?? '_site';
const routes = new Set(JSON.parse(readFileSync(join(root, 'packages/cloudy-ui/nav/routes.json'), 'utf8')).routes.map((r) => r.path));
const GROUPS = {
  c_agi: 'ai-chat cloud-code cloud-myterminal cloud-search cloud-terminal cloud-tools-small-llms',
  c_configs: 'cloud-c3 cloud-store cloud-superapp',
  c_inboxes: 'c3-bot cloud-chat cloud-dialer cloud-mail cloud-matrix cloud-news',
  'c_data-apps': 'cloud-contacts cloud-drive cloud-gallery cloud-media cloud-notes cloud-office cloud-tasks cloud-vault',
  c_tools: 'cloud-browser cloud-calc cloud-camera cloud-keyboard cloud-me cloud-nav cloud-wallet cloud-writer',
};
const FORCE = { '/cloud-mobile/': '/cloud-webapps/', '/cloud-superapp/cloud/apps/': '/cloud-webapps/', '/cloud-web/': '/cloud-webapps/cloud/webapps/' };
export const stub = (to) => `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Moved</title><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="https://diegonmarcos.github.io${to}"><script>location.replace(${JSON.stringify(to)}+location.search+location.hash)</script></head><body>Moved to <a href="${to}">${to}</a></body></html>\n`;
let written = 0, kept = 0;
const put = (url, to, force = false) => {
  const file = join(site, url.endsWith('/') ? `${url}index.html` : url);
  if (!force && existsSync(file)) { kept++; return; }
  if (to === url) { kept++; return; }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, stub(to)); written++;
};

for (const url of readFileSync(join(root, 'scripts/old-urls.txt'), 'utf8').split('\n').filter((l) => l.startsWith('/'))) {
  if (FORCE[url]) { put(url, FORCE[url], true); continue; }
  const to = oldUrlTarget(url, routes);
  if (!to) throw new Error(`gen-redirects: no target for ${url}`);
  put(url, to);
}
put('/c__Cloud/', '/cloud-webapps/');
for (const [g, apps] of Object.entries(GROUPS)) {
  put(`/c__Cloud/${g}/`, '/cloud-webapps/');
  for (const a of apps.split(' ')) put(`/c__Cloud/${g}/${a}/`, oldUrlTarget(`/cloud-webapps/${a}/`, routes));
}
console.log(`redirect stubs written to ${site}: ${written} (${kept} kept: the deploy already serves them)`);
