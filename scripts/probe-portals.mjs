#!/usr/bin/env node
// Portal probe (#1320 B.4): a vendor UI may be framed only when its response allows it. For every portal in
// packages/cloudy-ui/nav/nav-overlay.json, GET the URL (following redirects, e.g. to the sign-in page) and read
// X-Frame-Options and CSP frame-ancestors; the result must equal the declared `embeddable`. A portal declared embeddable
// whose site refuses framing (or answers >= 400, or cannot be reached) fails, and so does one declared not embeddable that would frame.
//   node scripts/probe-portals.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const portals = JSON.parse(readFileSync(join(root, 'packages/cloudy-ui/nav/nav-overlay.json'), 'utf8')).portals;
const ORIGIN = 'https://diegonmarcos.github.io';
export function frameable(xfo, csp) {
  if (xfo && /deny|sameorigin/i.test(xfo)) return false;
  const fa = /frame-ancestors([^;]*)/i.exec(csp ?? '')?.[1]?.trim();
  if (fa === undefined) return true;
  return fa.split(/\s+/).some((s) => s === '*' || s === ORIGIN || s === 'https:' || (s.startsWith('https://*.') && ORIGIN.endsWith(s.slice(9))));
}
let bad = 0;
for (const [id, p] of Object.entries(portals)) {
  let ok;
  try {
    const r = await fetch(p.url, { redirect: 'follow', signal: AbortSignal.timeout(8000) });
    ok = r.status < 400 && frameable(r.headers.get('x-frame-options'), r.headers.get('content-security-policy'));
    console.log(`${id}: ${p.url} -> ${r.status} ${r.url} xfo=${r.headers.get('x-frame-options') ?? '-'} frame-ancestors=${/frame-ancestors([^;]*)/i.exec(r.headers.get('content-security-policy') ?? '')?.[1]?.trim() ?? '-'} => ${ok ? 'embeddable' : 'not embeddable'}`);
  } catch (e) {
    ok = false;
    console.log(`${id}: ${p.url} unreachable (${e.cause?.code ?? e.message}) => not embeddable`);
  }
  if (ok !== p.embeddable) { console.error(`FAIL ${id}: declared embeddable=${p.embeddable}, the site says ${ok}`); bad++; }
}
if (bad) process.exit(1);
console.log('ok: every portal declaration matches its site');
