// Read-only access to the Android sources the web generators derive from (#1320 C.1).
//   default            : diegonmarcos/cloudy-u-android main through `gh api` (CI: GH_TOKEN = github.token)
//   --android <dir>    : a local cloudy-u-android checkout (also env CLOUD_U_ANDROID)
// Every generator writes a GENERATED header and supports --check (exit 1 when the committed output
// differs from a fresh render), so an Android-side change fails CI instead of drifting silently.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

export const REPO = 'diegonmarcos/cloudy-u-android';
const args = process.argv.slice(2);
export const CHECK = args.includes('--check');
const li = args.indexOf('--android');
export const LOCAL = li >= 0 ? resolve(args[li + 1]) : process.env.CLOUD_U_ANDROID || '';

const cache = new Map();
/** Raw text of <rel> in cloudy-u-android, or null when the file does not exist. */
export function readRaw(rel) {
  if (cache.has(rel)) return cache.get(rel);
  let out = null;
  if (LOCAL) out = existsSync(join(LOCAL, rel)) ? readFileSync(join(LOCAL, rel), 'utf8') : null;
  else {
    try {
      out = execFileSync('gh', ['api', '-H', 'Accept: application/vnd.github.raw', `repos/${REPO}/contents/${rel}?ref=main`],
        { maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8');
    } catch (e) {
      if (!/404|Not Found/.test(String(e.stderr ?? e.message))) throw e;
    }
  }
  cache.set(rel, out);
  return out;
}
/** Like readRaw, but a missing source is an error naming the file (a rename on Android must fail loudly). */
export function need(rel) {
  const t = readRaw(rel);
  if (t == null) throw new Error(`source missing in ${REPO}: ${rel}`);
  return t;
}
/** Directory listing (names) of <rel> in cloudy-u-android. */
export function listDir(rel) {
  if (LOCAL) return execFileSync('ls', [join(LOCAL, rel)]).toString().split('\n').filter(Boolean);
  const j = JSON.parse(execFileSync('gh', ['api', '--paginate', `repos/${REPO}/contents${rel ? `/${rel}` : ''}?ref=main`, '--jq', '[.[].name]'],
    { maxBuffer: 64 * 1024 * 1024 }).toString().replace(/\]\s*\[/g, ','));
  return j;
}

/** Write (or, with --check, compare) a set of generated files. Returns the list of stale paths. */
export function emit(root, files, label) {
  const stale = [];
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, rel);
    if (CHECK) { if (!existsSync(p) || readFileSync(p, 'utf8') !== text) stale.push(rel); }
    else { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); }
  }
  if (CHECK && stale.length) {
    console.error(`${label} is OUT OF SYNC with ${REPO} main: ${stale.slice(0, 12).join(', ')}${stale.length > 12 ? ` (+${stale.length - 12})` : ''}\nFix: node scripts/${label}.mjs`);
    process.exit(1);
  }
  return stale;
}
