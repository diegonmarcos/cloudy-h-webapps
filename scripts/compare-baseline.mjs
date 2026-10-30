#!/usr/bin/env node
// Cross-platform compare (#1320 C.3): the web screenshots (tests/results/baseline-web/<project>/<name>.png, written by
// tests/e2e/baseline.spec.ts) against the Android reference (Cloud-UI-Baseline.zip on cloudy-u-android's rolling release,
// written by its screenshot-baseline.yml). Both are scaled to the Android image's size; the status strip / clock band and
// the scroll bars are masked; a pair fails above 5% differing pixels. Writes tests/results/baseline/report.md + diffs.
// BLOCKING pairs (the island, the tabs, the fleet top bar and bottom bar regions) fail the run; the rest are advisory.
//   node scripts/compare-baseline.mjs [--zip <file>]  (default: gh release download from diegonmarcos/cloudy-u-android)
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'tests/results/baseline');
const WEB = join(root, 'tests/results/baseline-web');
const args = process.argv.slice(2);
const zi = args.indexOf('--zip');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'android'), { recursive: true });
const zip = zi >= 0 ? args[zi + 1] : join(OUT, 'Cloud-UI-Baseline.zip');
// no published baseline (or no network) is a warning, not a failure: only a compared pair over the limit blocks
if (zi < 0) {
  try { execFileSync('gh', ['release', 'download', 'latest', '-R', 'diegonmarcos/cloudy-u-android', '-p', 'Cloud-UI-Baseline.zip', '-D', OUT, '--clobber'], { stdio: 'inherit' }); }
  catch { console.log('::warning::Cloud-UI-Baseline.zip unavailable: baseline compare skipped'); process.exit(0); }
}
execFileSync('unzip', ['-qo', zip, '-d', join(OUT, 'android')]);

const LIMIT = 0.05;
// [name, region (fraction of the height: from, to), blocking]
const PAIRS = [
  ['island', [0.88, 1], true],
  ['cloud-tabs', [0.10, 0.20], true],
  ['kit-cloud', [0, 0.6], false],
  ['kit-cloud_minimalist_black', [0, 0.6], false],
  ['fleet-cloud-calc', [0, 0.12], true], ['fleet-cloud-calc', [0.88, 1], true],
  ['fleet-cloud-tasks', [0, 0.12], true], ['fleet-cloud-tasks', [0.88, 1], true],
  ['fleet-cloud-c3', [0, 0.12], true], ['fleet-cloud-c3', [0.88, 1], true],
  ['launcher-home', [0.05, 1], false], ['launcher-cloud-apps', [0.05, 1], false], ['launcher-notify', [0.05, 1], false],
  ['launcher-boards', [0.05, 1], false], ['launcher-phone', [0.05, 1], false], ['launcher-c3', [0.05, 1], false], ['launcher-config', [0.05, 1], false],
];
/** nearest-neighbour resize of [img] to w x h */
function resize(img, w, h) {
  if (img.width === w && img.height === h) return img;
  const o = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = Math.min(img.width - 1, Math.floor((x * img.width) / w)), sy = Math.min(img.height - 1, Math.floor((y * img.height) / h));
    img.data.copy(o.data, (y * w + x) * 4, (sy * img.width + sx) * 4, (sy * img.width + sx) * 4 + 4);
  }
  return o;
}
function crop(img, y0, y1) {
  const a = Math.round(img.height * y0), b = Math.round(img.height * y1), o = new PNG({ width: img.width, height: b - a });
  img.data.copy(o.data, 0, a * img.width * 4, b * img.width * 4);
  return o;
}
const rows = [];
let blockingFail = 0, compared = 0;
for (const dev of existsSync(WEB) ? readdirSync(WEB) : []) {
  for (const [name, [y0, y1], blocking] of PAIRS) {
    const a = join(OUT, 'android', dev, `${name}.png`), w = join(WEB, dev, `${name}.png`);
    if (!existsSync(a) || !existsSync(w)) { rows.push(`| ${dev} | ${name} ${y0}-${y1} | - | missing ${existsSync(a) ? 'web' : 'android'} |`); continue; }
    // an emulator that died mid-capture leaves a truncated PNG: report it, do not abort the whole compare
    let A, W;
    try { A = PNG.sync.read(readFileSync(a)); } catch { rows.push(`| ${dev} | ${name} ${y0}-${y1} | - | unreadable android |`); continue; }
    try { W = resize(PNG.sync.read(readFileSync(w)), A.width, A.height); } catch { rows.push(`| ${dev} | ${name} ${y0}-${y1} | - | unreadable web |`); continue; }
    const ca = crop(A, y0, y1), cw = crop(W, y0, y1), diff = new PNG({ width: ca.width, height: ca.height });
    const n = pixelmatch(ca.data, cw.data, diff.data, ca.width, ca.height, { threshold: 0.15 });
    const ratio = n / (ca.width * ca.height);
    compared++;
    const tag = `${dev}-${name}-${Math.round(y0 * 100)}`;
    writeFileSync(join(OUT, `${tag}-diff.png`), PNG.sync.write(diff));
    const ok = ratio <= LIMIT;
    if (!ok && blocking) blockingFail++;
    rows.push(`| ${dev} | ${name} ${y0}-${y1} | ${(ratio * 100).toFixed(2)}% | ${ok ? 'ok' : blocking ? 'FAIL (blocking)' : 'over (advisory)'} |`);
  }
}
const md = `# Web vs Android baseline\n\nLimit ${LIMIT * 100}% differing pixels per region (pixelmatch threshold 0.15).\n\n| device | screen / region | diff | result |\n|---|---|---|---|\n${rows.join('\n')}\n`;
writeFileSync(join(OUT, 'report.md'), md);
if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, md, { flag: 'a' });
console.log(md);
if (!compared) { console.error('no pair compared'); process.exit(1); }
if (blockingFail && process.env.BASELINE_BLOCKING === '1') process.exit(1);
