// The shell's decorative layers, ported from aa_cloud-superapp ui/ShellFx.kt and launcher/themes/cloud/Home3DFragment.kt
// value for value. Coordinates and stroke widths are DEVICE pixels, as Compose's Canvas draws them (the canvas backing store
// is sized clientWidth x devicePixelRatio), so a 3.5f tail is 3.5 device px on both.
import { KotlinRandom } from '../lib/kotlinRandom';

export type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, density: number, phase: number) => void;
const TWO_PI = Math.PI * 2;
const rgba = (argb: number, alphaMul = 1) => {
  const a = ((argb >>> 24) & 255) / 255, r = (argb >>> 16) & 255, g = (argb >>> 8) & 255, b = argb & 255;
  return `rgba(${r},${g},${b},${(a * alphaMul).toFixed(4)})`;
};

// ── Galaxy backdrop: 221 stars from Random(20260531L), 3 comets, 18 s lap ──
type Star = { x: number; y: number; r: number; phase: number };
export const STARS: Star[] = (() => {
  const rng = new KotlinRandom(20260531n);
  return Array.from({ length: 221 }, () => ({ x: rng.nextFloat(), y: rng.nextFloat(), r: rng.nextFloat() * 2.2 + 0.4, phase: rng.nextFloat() * TWO_PI }));
})();
const COMETS = [
  [0.0, -0.15, -0.1, 1.2, 0.95, 0.35],
  [0.42, 1.15, 0.05, -0.2, 1.05, 0.4],
  [0.78, -0.15, 0.85, 1.1, -0.1, 0.32],
] as const;
export const GALAXY_PERIOD_MS = 18_000;
export const drawGalaxy: Draw = (ctx, w, h, _d, time) => {
  ctx.clearRect(0, 0, w, h);
  for (const s of STARS) {
    const twinkle = Math.abs(Math.sin(time * 12 + s.phase) * 0.4 + 0.6);
    const a = Math.min(255, Math.max(40, Math.trunc(twinkle * 220)));
    ctx.fillStyle = `rgba(233,216,253,${a / 255})`;
    ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, TWO_PI); ctx.fill();
  }
  ctx.lineCap = 'round';
  for (const [phase, sx, sy, ex, ey, travel] of COMETS) {
    const cycle = (time + phase) % 1;
    if (cycle > travel) continue;
    const prog = cycle / travel;
    const hx = (sx + (ex - sx) * prog) * w, hy = (sy + (ey - sy) * prog) * h;
    const dx = (ex - sx) * w, dy = (ey - sy) * h, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, tail = 220;
    for (let i = 0; i < 12; i++) {
      const t0 = i / 12, t1 = (i + 1) / 12;
      ctx.strokeStyle = `rgba(183,148,244,${Math.min(255, Math.max(0, Math.trunc((1 - t0) * 230))) / 255})`;
      ctx.lineWidth = 3.5 - t0 * 3;
      ctx.beginPath(); ctx.moveTo(hx - ux * tail * t0, hy - uy * tail * t0); ctx.lineTo(hx - ux * tail * t1, hy - uy * tail * t1); ctx.stroke();
    }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(hx - ux * 4, hy - uy * 4); ctx.lineTo(hx + ux * 4, hy + uy * 4); ctx.stroke();
  }
};

// ── Dynamic Island: four-channel wave (358.8 s per 1000 time units) + prismatic frame (3.6 s lap) ──
const WAVES = [
  [0x99b69ef9, 1.6, 2.7, 3.5, 1.1, 0.85, 0.45, 0.0, 0.88],
  [0xb3cabdfb, 1.9, 2.4, 4.1, 1.5, 0.7, 0.6, 1.3, 0.82],
  [0xccddd6f3, 2.3, 3.1, 4.7, 0.9, 0.55, 0.32, 2.5, 0.76],
  [0xe6ede9fe, 2.8, 3.6, 5.2, 1.8, 0.4, 0.78, 0.7, 0.7],
] as const;
export const WAVE_PERIOD_MS = 358_800;
function pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}
export const drawIslandWave: Draw = (ctx, w, h, density, phase) => {
  ctx.clearRect(0, 0, w, h);
  const time = phase * 1000, inset = 2 * density, radius = Math.min(w - 2 * inset, h - 2 * inset) * 0.5;
  ctx.save(); pill(ctx, inset, inset, w - 2 * inset, h - 2 * inset, radius); ctx.clip();
  const step = Math.max(w / 90, 1);
  for (const [color, baseFreq, h2, h3, speed, baseAmp, modFreq, modPhase, yFrac] of WAVES) {
    const baseline = h * yFrac;
    const ampMod = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * modFreq + modPhase));
    const amp = baseAmp * ampMod * (h * 0.45);
    ctx.beginPath();
    for (let x = 0, first = true; x <= w; x += step) {
      const t = x / w;
      const c = Math.sin(t * baseFreq * TWO_PI + time * speed) * 0.55 + Math.sin(t * baseFreq * h2 * TWO_PI + time * speed * 1.3) * 0.3 + Math.sin(t * baseFreq * h3 * TWO_PI + time * speed * 0.8) * 0.15;
      if (first) { ctx.moveTo(x, baseline + c * amp); first = false; } else ctx.lineTo(x, baseline + c * amp);
    }
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = rgba(color); ctx.fill();
  }
  ctx.restore();
};
const RAINBOW = ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#00e5ff', '#2979ff', '#aa00ff', '#ff1744'];
export const PRISM_PERIOD_MS = 3_600;
export const drawPrism: Draw = (ctx, w, h, _d, progress) => {
  ctx.clearRect(0, 0, w, h);
  const sw = 3, rw = w - 2 * sw, rh = h - 2 * sw, cx = sw + rw / 2, cy = sw + rh / 2;
  // Android SweepGradient starts at 3 o'clock and turns clockwise; canvas conic gradients start at the same angle.
  const g = ctx.createConicGradient(progress * TWO_PI, cx, cy);
  RAINBOW.forEach((c, i) => g.addColorStop(i / (RAINBOW.length - 1), c));
  ctx.strokeStyle = g; ctx.lineWidth = sw;
  pill(ctx, sw, sw, rw, rh, rh / 2); ctx.stroke();
};
export const WAVELINE_PERIOD_MS = 3_200;
export const drawWaveLine: Draw = (ctx, w, h, density, turn) => {
  ctx.clearRect(0, 0, w, h);
  const phase = turn * TWO_PI, cy = h / 2, amp = h * 0.22, fb = (TWO_PI / w) * 2.4, fc = (TWO_PI / w) * 7;
  ctx.beginPath(); ctx.moveTo(0, cy);
  for (let x = 0; x <= w; x += Math.max(2 * density, 1)) ctx.lineTo(x, cy + (Math.sin(x * fb + phase) + Math.sin(x * fc - phase * 1.7) * 0.3) * amp);
  ctx.strokeStyle = rgba(0xb0c4b5fd); ctx.lineWidth = density; ctx.lineCap = 'round'; ctx.stroke();
};

// ── Home: the neon wireframe cube (CubeMath), 16 s Y / 23.5 s X periods ──
const V = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
export const CUBE = { PERIOD_Y_MS: 16_000, PERIOD_X_MS: 23_500, ROT_Y0: -Math.PI / 5.5, ROT_X0: Math.PI / 7 };
export function cubeProject(rotX: number, rotY: number, width: number, height: number) {
  const cx = width / 2, cy = height / 2, scale = Math.min(width, height) / 4.6, persp = 4.5;
  const cyR = Math.cos(rotY), syR = Math.sin(rotY), cxR = Math.cos(rotX), sxR = Math.sin(rotX);
  return V.map(([x, y, z]) => {
    const x1 = x * cyR + z * syR, z1 = -x * syR + z * cyR, y2 = y * cxR - z1 * sxR, z2 = y * sxR + z1 * cxR, k = persp / (persp + z2);
    return { x: cx + x1 * scale * k, y: cy + y2 * scale * k, z: z2 };
  });
}
export const edgeAlpha = (avgZ: number) => (255 - Math.min(120, Math.max(0, avgZ * 80))) / 255;
/** [ink] = palette text_primary, [glow] = palette accent (CSS colours). [elapsedMs] 0 = the still frame (animation off). */
export function drawCube(ctx: CanvasRenderingContext2D, w: number, h: number, elapsedMs: number, ink: string, glow: string) {
  ctx.clearRect(0, 0, w, h);
  const rx = CUBE.ROT_X0 + (elapsedMs / CUBE.PERIOD_X_MS) * TWO_PI, ry = CUBE.ROT_Y0 + (elapsedMs / CUBE.PERIOD_Y_MS) * TWO_PI;
  const p = cubeProject(rx, ry, w, h);
  ctx.lineCap = 'round';
  for (const [lw, a] of [[18, 0.12], [12, 0.22], [7, 0.32]]) {
    ctx.strokeStyle = glow; ctx.globalAlpha = a; ctx.lineWidth = lw;
    for (const [i, j] of E) { ctx.beginPath(); ctx.moveTo(p[i].x, p[i].y); ctx.lineTo(p[j].x, p[j].y); ctx.stroke(); }
  }
  ctx.strokeStyle = ink; ctx.lineWidth = 4;
  for (const [i, j] of E) { ctx.globalAlpha = edgeAlpha((p[i].z + p[j].z) / 2); ctx.beginPath(); ctx.moveTo(p[i].x, p[i].y); ctx.lineTo(p[j].x, p[j].y); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.fillStyle = glow;
  for (const v of p) { ctx.beginPath(); ctx.arc(v.x, v.y, 4, 0, TWO_PI); ctx.fill(); }
}

/** Svelte action: size the canvas to its box x devicePixelRatio and run [draw] on a looping phase; one still frame when the
 *  reader asked for reduced motion (Android: animator duration scale 0 / battery saver hold the layers still). */
export function fxCanvas(canvas: HTMLCanvasElement, opts: { draw: Draw; periodMs: number }) {
  let raf = 0, start = performance.now(), o = opts;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const size = () => { const d = devicePixelRatio || 1; canvas.width = Math.round(canvas.clientWidth * d); canvas.height = Math.round(canvas.clientHeight * d); return d; };
  let density = size();
  const frame = (now: number) => {
    if (!ctx) return;
    o.draw(ctx, canvas.width, canvas.height, density, still ? 0 : ((now - start) / o.periodMs) % 1);
    if (!still) raf = requestAnimationFrame(frame);
  };
  const ro = new ResizeObserver(() => { density = size(); if (still) frame(start); });
  ro.observe(canvas);
  raf = requestAnimationFrame(frame);
  return { update(n: typeof opts) { o = n; }, destroy() { cancelAnimationFrame(raf); ro.disconnect(); } };
}
