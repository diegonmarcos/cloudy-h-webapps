import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The snapshot is published inside both sites' dists: no credential-like string, no dropped field name, may ever be in it.
const DIR = join(dirname(fileURLToPath(import.meta.url)), 'data');
const BAD = /ghp_|github_pat_|eyJ[A-Za-z0-9_-]{20}|BEGIN [A-Z ]*PRIVATE|AKIA[0-9A-Z]{12}|sk-[A-Za-z0-9]{20}|ocid1\.[a-z]+\.oc1|"(ssh_key|instance_id|wg_public_key|private_key|password|token|api_key)":/;
describe('c3-data snapshot', () => {
  for (const f of readdirSync(DIR)) it(`${f} carries no secret`, () => expect(BAD.test(readFileSync(join(DIR, f), 'utf8'))).toBe(false));
});
