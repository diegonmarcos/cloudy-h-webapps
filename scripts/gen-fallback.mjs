#!/usr/bin/env node
// Generates one fallback site per container/service: services/<service>/src/index.html (+ identical dist/index.html),
// published at /cloud-webapps/<service>/ (the Pages ship step maps services/<slug>/dist), from scripts/fallback-services.json (vendored copy of
// cloud-u-containers _shared/fallback-services.json, kept in sync by scripts/sync-fallback-services.mjs; itself generated from every <service>/build.json).
// Caddy's shared 401/403 handler redirects browsers here: https://diegonmarcos.github.io/cloud-webapps/<service>/.
// Same nav + design as the app sites. Public facts only: no secrets, no addresses. `--check` fails when stale.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'scripts/fallback-services.json'), 'utf8'));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inc = '<link rel="stylesheet" href="/cloud-webapps/nav.css"><script src="/cloud-webapps/nav.js" defer></script>';
const MESH_PAGE = '/cloud-webapps/c3-security-network/', API_PAGE = '/cloud-webapps/c3-mcp-apis/';

const css = `:root{--bg:#0b0f17;--fg:#e6e9ef;--mut:#9aa4b2;--card:#141a26;--bd:#243049;--ac:#4cc2ff}
@media (prefers-color-scheme:light){:root{--bg:#f6f8fb;--fg:#162033;--mut:#5a6579;--card:#fff;--bd:#d6dde9;--ac:#0a6fb8}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:860px;margin:0 auto;padding:24px 16px 64px}a{color:var(--ac)}nav.crumbs{font-size:14px;color:var(--mut);margin-bottom:12px}
h1{font-size:2rem;margin:.2em 0}h2{font-size:1.2rem;margin:1.8em 0 .6em;border-bottom:1px solid var(--bd);padding-bottom:.3em}
.lead{color:var(--mut)}.card{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:16px;margin:12px 0}
.btn{display:inline-block;padding:10px 16px;border-radius:10px;border:1px solid var(--ac);text-decoration:none;font-weight:600;margin:4px 8px 4px 0}
.btn.p{background:var(--ac);color:#04121c}code{background:var(--card);border:1px solid var(--bd);border-radius:6px;padding:1px 6px}`;

// Return-URL handling: ?rd= is honoured ONLY for https URLs on a host declared for this service (no open redirect).
const script = hosts => `(function(){var H=${JSON.stringify(hosts)};var ret='https://'+H[0]+'/';
try{var u=new URL(new URLSearchParams(location.search).get('rd')||'');if(u.protocol==='https:'&&H.indexOf(u.hostname)>=0&&!u.username&&!u.password)ret=u.origin+u.pathname;}catch(e){}
var e=encodeURIComponent(ret);document.querySelectorAll('a[data-rd]').forEach(function(a){a.href=a.getAttribute('data-base')+e;});})();`;

function page(s) {
  const hasHosts = s.hosts.length > 0;
  const portal = (base, label, cls) => `<a class="btn ${cls}" data-rd href="${esc(base)}${encodeURIComponent('https://' + s.hosts[0] + '/')}" data-base="${esc(base)}">${label}</a>`;
  const sections = [];
  if (hasHosts) sections.push(`<h2>Sign in</h2><div class="card"><p>This service is at <code>${s.hosts.map(esc).join('</code>, <code>')}</code>${s.signin ? ' and needs a signed-in session' : ''}. Pick a provider (${data.providers.map(esc).join(', ')}); you come back to the service afterwards.</p>
${portal(data.auth_portal + '?rd=', 'Sign in (provider chooser)', 'p')}${portal(data.account_portal + '?rd=', 'Account', '')}</div>`);
  if (s.mesh) sections.push(`<h2>Join the mesh</h2><div class="card"><p>Private name on the mesh: <code>${esc(s.mesh)}</code>. Join the WireGuard mesh (or enrol the device in Cloudflare WARP) and the name resolves; off the mesh it answers 403. How to join: <a href="${MESH_PAGE}">Security &amp; Network</a>.</p></div>`);
  if (s.bearer) sections.push(`<h2>API access (bearer)</h2><div class="card"><p>Clients authenticate with <code>Authorization: Bearer &lt;token&gt;</code>; tokens are issued after an owner sign-in through the auth portal. Non-browser clients keep the plain 401/403 status and are never redirected here. Details: <a href="${API_PAGE}">MCP &amp; APIs</a>.</p></div>`);
  if (!sections.length) sections.push('<h2>Access</h2><div class="card"><p>This service is internal to the fleet and has no direct entry point.</p></div>');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(s.slug)} - Cloud service</title>
<meta name="description" content="${esc(s.description)}">
<style>
${css}
</style>
</head>
<body>
<main>
<nav class="crumbs"><a href="/cloud-webapps/">Cloud apps</a> / ${esc(s.slug)}</nav>
<h1>${esc(s.slug)}</h1>
<p class="lead">${esc(s.description)}</p>
<p>You reached this page because the service answered 401 or 403 for this browser. Here is how to get in.</p>
${sections.join('\n')}
</main>${hasHosts ? `\n<script>${script(s.hosts)}</script>` : ''}
</body>
</html>
`.replace('</head>', inc + '\n</head>');
}

const apkDirs = new Set(readdirSync(root).filter(d => existsSync(join(root, d, 'build.json'))));
let bad = 0;
const check = process.argv.includes('--check');
for (const s of data.services) {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(s.slug)) { console.error('bad slug', s.slug); process.exit(1); }
  if (apkDirs.has(s.slug)) { console.error('service slug collides with an app folder:', s.slug); process.exit(1); }
  const html = page(s);
  for (const sub of ['src', 'dist']) {
    const f = join(root, 'services', s.slug, sub, 'index.html');
    if (check) { if (!existsSync(f) || readFileSync(f, 'utf8') !== html) { console.error('stale or missing', f); bad++; } }
    else { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); }
  }
}
if (bad) process.exit(1);
console.log(check ? `ok: ${data.services.length} service pages current` : `wrote ${data.services.length} service pages`);
