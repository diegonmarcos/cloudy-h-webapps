import { describe, expect, it } from 'vitest';
import { cssAngle, cssColor } from './color.mjs';
import { snake } from './vector.mjs';

describe('Android -> CSS conversions', () => {
  it('colours: #AARRGGBB -> #rrggbb[aa]', () => {
    expect(cssColor('#FF140B26')).toBe('#140b26');
    expect(cssColor('#33A78BFA')).toBe('#a78bfa33');
    expect(cssColor('#FFF')).toBe('#ffffff');
    expect(cssColor('#7C3AED')).toBe('#7c3aed');
  });
  it('gradient angles: Android counter-clockwise from left->right, CSS clockwise from to-top', () => {
    expect(cssAngle(0)).toBe(90);
    expect(cssAngle(90)).toBe(0);
    expect(cssAngle(270)).toBe(180);
    expect(cssAngle(135)).toBe(315);
  });
  it('Compose icon idents -> Material file names', () => {
    expect(snake('CalendarMonth')).toBe('calendar_month');
    expect(snake('Inventory2')).toBe('inventory_2');
    expect(snake('AutoFixHigh')).toBe('auto_fix_high');
  });
});
