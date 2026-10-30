import { describe, expect, it } from 'vitest';
import { checkBottomNav } from './navLimits';

describe('NavDecl limits', () => {
  it('accepts 2..8 items', () => { expect(checkBottomNav(['a', 'b']).length).toBe(2); expect(checkBottomNav('abcdefgh'.split('')).length).toBe(8); });
  it('rejects 9 items and 1 item', () => {
    expect(() => checkBottomNav('abcdefghi'.split(''))).toThrow();
    expect(() => checkBottomNav(['a'])).toThrow();
  });
});
