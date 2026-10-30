import { describe, expect, it } from 'vitest';
import { KotlinRandom } from './kotlinRandom';

describe('KotlinRandom (XorWow)', () => {
  it('is deterministic per seed and in [0,1)', () => {
    const a = new KotlinRandom(20260531n), b = new KotlinRandom(20260531n);
    for (let i = 0; i < 100; i++) { const x = a.nextFloat(); expect(x).toBe(b.nextFloat()); expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThan(1); }
  });
  it('matches kotlin-stdlib 1.9.0 Random(42) / Random(20260531L) (reference run through java -cp kotlin-stdlib)', () => {
    const r = new KotlinRandom(42n);
    expect([r.nextInt(), r.nextInt(), r.nextInt()]).toEqual([972016666, 1740578880, -408207414]);
    const g = new KotlinRandom(20260531n);
    expect([g.nextFloat(), g.nextFloat(), g.nextFloat()].map((f) => Math.fround(f))).toEqual([0.79179585, 0.75394744, 0.46490914].map(Math.fround));
  });
  it('seeds split like Random(seed: Long): low and high 32 bits', () => {
    expect(new KotlinRandom(1n).nextInt()).not.toBe(new KotlinRandom(1n << 32n).nextInt());
  });
});
