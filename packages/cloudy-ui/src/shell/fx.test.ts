import { describe, expect, it } from 'vitest';
import { STARS, cubeProject, edgeAlpha, CUBE } from './fx';

describe('shell fx (ShellFx.kt / Home3DFragment.kt ports)', () => {
  it('221 stars, radius 0.4..2.6 device px, inside the unit square', () => {
    expect(STARS.length).toBe(221);
    for (const s of STARS) { expect(s.r).toBeGreaterThanOrEqual(0.4); expect(s.r).toBeLessThan(2.6); expect(s.x).toBeLessThan(1); expect(s.y).toBeLessThan(1); }
  });
  it('the cube projects into its box, centred', () => {
    const p = cubeProject(CUBE.ROT_X0, CUBE.ROT_Y0, 360, 360);
    expect(p.length).toBe(8);
    const cx = p.reduce((a, v) => a + v.x, 0) / 8;
    expect(Math.abs(cx - 180)).toBeLessThan(20);
    for (const v of p) { expect(v.x).toBeGreaterThan(0); expect(v.x).toBeLessThan(360); }
  });
  it('back edges fade from 255 to 135', () => {
    expect(edgeAlpha(-1)).toBe(1);
    expect(edgeAlpha(5)).toBeCloseTo(135 / 255, 6);
  });
});
