import { describe, expect, it } from 'vitest';
// @ts-expect-error plain .mjs helper (also runnable as `node scripts/lib/dead-code.mjs`)
import { deadCode } from './lib/dead-code.mjs';

// Ratchet of the optimisation pass: removed code cannot creep back as dead exports or orphan modules (mutation.yml dead-export / dead-module).
describe('dead code', () => {
  it('the @cloudy/ui barrel exports only consumed names and every package module is imported', () => expect(deadCode()).toEqual([]));
});
