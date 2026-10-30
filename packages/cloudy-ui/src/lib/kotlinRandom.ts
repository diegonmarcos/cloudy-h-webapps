// kotlin.random.Random(seed: Long) — XorWowRandom, bit for bit, so a layout Android seeds (the galaxy's 221 stars,
// Random(20260531L) in ShellFx.kt) lands on the same coordinates on the web.
export class KotlinRandom {
  private x: number; private y: number; private z: number; private w: number; private v: number; private addend: number;
  constructor(seed: number | bigint) {
    const s = BigInt.asIntN(64, BigInt(seed));
    const seed1 = Number(BigInt.asIntN(32, s));
    const seed2 = Number(BigInt.asIntN(32, s >> 32n));
    this.x = seed1 | 0; this.y = seed2 | 0; this.z = 0; this.w = 0; this.v = ~seed1 | 0;
    this.addend = ((seed1 << 10) ^ (seed2 >>> 4)) | 0;
    for (let i = 0; i < 64; i++) this.nextInt();
  }
  nextInt(): number {
    let t = this.x;
    t = t ^ (t >>> 2);
    this.x = this.y; this.y = this.z; this.z = this.w;
    const v0 = this.v;
    this.w = v0;
    t = (t ^ (t << 1)) ^ v0 ^ (v0 << 4);
    this.v = t | 0;
    this.addend = (this.addend + 362437) | 0;
    return (t + this.addend) | 0;
  }
  nextBits(bitCount: number): number {
    return (this.nextInt() >>> (32 - bitCount)) & (-bitCount >> 31);
  }
  /** Kotlin Random.nextFloat(): 24 random bits / 2^24. */
  nextFloat(): number {
    return this.nextBits(24) / (1 << 24);
  }
}
