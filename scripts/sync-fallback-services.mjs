#!/usr/bin/env node
// scripts/fallback-services.json is DERIVED, never hand-edited: it is the published copy of
// cloud-u-containers _shared/fallback-services.json (generated there from every <service>/build.json).
// default: fetch it, overwrite the local copy and regenerate the pages. --check: fail on drift.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const local = join(root, 'scripts/fallback-services.json');
const url = process.env.FALLBACK_SERVICES_URL || 'https://raw.githubusercontent.com/diegonmarcos/cloudy-u-containers/main/_shared/fallback-services.json';
const res = await fetch(url);
if (!res.ok) { console.error('FAIL fetch', url, res.status); process.exit(1); }
const remote = await res.text();
JSON.parse(remote);
if (remote === readFileSync(local, 'utf8')) { console.log('ok: fallback-services.json matches cloud-u-containers'); process.exit(0); }
if (process.argv.includes('--check')) { console.error('FAIL drift: scripts/fallback-services.json differs from cloud-u-containers; run node scripts/sync-fallback-services.mjs'); process.exit(1); }
writeFileSync(local, remote);
execFileSync('node', [join(root, 'scripts/gen-fallback.mjs')], { stdio: 'inherit' });
console.log('synced');
