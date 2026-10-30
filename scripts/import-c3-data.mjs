#!/usr/bin/env node
// One-time import (#1320 D.2) of the C3 control-centre datasets from the old portal (cloudy-h-webapps-2
// a_Portals/cloud/src/data/{c3-*,cloud}.json) into packages/c3-data/data/, the committed snapshot both sites prerender from.
// Live mode reads the c3-infra-api (mesh first, public bearer fallback); this snapshot is what a browser without it sees.
// Redacted on the way in: key/credential paths, cloud instance ids, WireGuard keys, personal emails (the old portal published
// them; the new sites do not). A field whose NAME matches is dropped wherever it appears.
//   node scripts/import-c3-data.mjs <old-portal-data-dir>
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2];
if (!src) { console.error('usage: import-c3-data.mjs <dir>'); process.exit(2); }
const out = join(root, 'packages/c3-data/data');
export const DROP = /^(ssh_key|ssh_key_path|identity_file|key_path|instance_id|ocid|wg_public_key|wg_private_key|public_key|private_key|private_key_path|password|token|secret|api_key|bearer|email)$/i;
const scrub = (v) => Array.isArray(v) ? v.map(scrub)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([k]) => !DROP.test(k)).map(([k, x]) => [k, scrub(x)]))
  : typeof v === 'string' ? v.replace(/ocid1\.[a-z0-9.-]+/g, 'ocid1.…').replace(/\/home\/[^\s"]*\/(cloud-vault|\.ssh)\/[^\s"]*/g, '<key path>') : v;
mkdirSync(out, { recursive: true });
let n = 0;
for (const f of readdirSync(src).filter((f) => /^(c3-[a-z0-9-]+|cloud)\.json$/.test(f)).sort()) {
  writeFileSync(join(out, f), JSON.stringify(scrub(JSON.parse(readFileSync(join(src, f), 'utf8'))), null, 1) + '\n');
  n++;
}
console.log(`imported ${n} datasets into packages/c3-data/data (redacted)`);
