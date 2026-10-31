// Dead-code guard (optimisation ratchet): the @cloudy/ui barrel re-exports nothing without a production consumer, and no module
// under packages/*/ is left that nothing imports. Tests do not count as consumers (a helper only its test calls is dead).
// node scripts/lib/dead-code.mjs  -> prints the findings, exit 1 when there are any (the vitest guard calls deadCode()).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKIP = new Set(['node_modules', 'dist', '.svelte-kit', 'data', 'nav', 'icons', 'tokens', 'static']);
const walk = (d) => readdirSync(d).flatMap((n) => { if (SKIP.has(n)) return []; const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const isTest = (f) => /\.test\.ts$/.test(f);
const BARREL = join(root, 'packages/cloudy-ui/src/index.ts');
// test-only spec modules by design (never shipped): navDropdown pins the CSS dropdown cap, navLimits the NavDecl bottom-bar contract
const SPEC = new Set(['packages/cloudy-ui/src/shell/navDropdown.ts', 'packages/cloudy-ui/src/shell/navLimits.ts']);

export function deadCode() {
  const pkgFiles = walk(join(root, 'packages')).filter((f) => /\.(ts|svelte)$/.test(f) && !isTest(f));
  const siteFiles = ['cloudy-webapps', 'cloudy-c3'].flatMap((s) => walk(join(root, 'sites', s, 'src'))).filter((f) => /\.(ts|svelte|js)$/.test(f) && !isTest(f));
  const prod = [...pkgFiles, ...siteFiles];
  const text = new Map(prod.map((f) => [f, readFileSync(f, 'utf8')]));
  const findings = [];
  // 1. barrel exports: each name needs a production file other than the barrel and the module it comes from
  const barrel = readFileSync(BARREL, 'utf8');
  for (const m of barrel.matchAll(/export (?:type )?\{([^}]+)\} from '([^']+)'/g)) {
    const from = join(dirname(BARREL), m[2]);
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (!name) continue;
      const re = new RegExp(`\\b${name}\\b`);
      const used = prod.some((f) => f !== BARREL && !f.startsWith(from) && re.test(text.get(f)));
      if (!used) findings.push(`dead export: ${name} (packages/cloudy-ui/src/index.ts)`);
    }
  }
  // 2. modules: every package module is imported by some other production file (path ends in its name)
  for (const f of pkgFiles) {
    if (f === BARREL || basename(f) === 'app.d.ts' || SPEC.has(relative(root, f))) continue;
    const stem = basename(f).replace(/\.ts$/, '');
    const re = new RegExp(`['"\`][^'"\`]*/${stem.replace(/[.$]/g, '\\$&')}(\\.ts)?['"\`]`);
    if (!prod.some((g) => g !== f && re.test(text.get(g)))) findings.push(`unused module: ${relative(root, f)}`);
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const f = deadCode();
  for (const x of f) console.error(x);
  console.log(f.length ? `FAIL: ${f.length} dead` : 'ok: no dead exports or modules');
  process.exit(f.length ? 1 : 0);
}
