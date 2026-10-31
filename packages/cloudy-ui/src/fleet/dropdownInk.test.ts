import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { tokens } from '../../tokens/tokens';

// The first row's dropdown (NavTokens.dropdownInk): every entry in the on-surface ink, children only lighter by alpha.
const src = readFileSync(new URL('./FleetFirstRow.svelte', import.meta.url), 'utf8');
const css = src.slice(src.indexOf('<style>'));
const rule = (sel: string) => new RegExp(`\\n\\s*${sel.replace(/\./g, '\\.')} \\{([^}]*)\\}`).exec(css)?.[1] ?? '';

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const over = (ink: string, a: number, bg: string) =>
  '#' + [1, 3, 5].map((i) => Math.round(a * parseInt(ink.slice(i, i + 2), 16) + (1 - a) * parseInt(bg.slice(i, i + 2), 16)).toString(16).padStart(2, '0')).join('');
const ratio = (x: string, y: string) => { const [a, b] = [lum(x) + 0.05, lum(y) + 0.05]; return Math.max(a, b) / Math.min(a, b); };

describe('page-list dropdown ink (NavTokens on-surface)', () => {
  const n = tokens.nav as Record<string, string | number>;
  it('every entry draws the on-surface token, a child only adds the child alpha', () => {
    expect(rule('.item')).toContain('color: var(--nav-dropdown-on-surface)');
    expect(rule('.item.child')).toBe(' opacity: var(--nav-dropdown-child-alpha); ');
    expect(rule('.item.child')).not.toContain('color');
    expect(rule('.item.on')).not.toContain('color');
    expect(src).toContain('class:child={!r.selected && r.indent > 0}');
  });
  it('a child, a selected and a disabled entry read at least 4.5:1 on the dark and light surface', () => {
    for (const bg of [n.dropdownSurfaceDark, n.dropdownSurfaceLight] as string[])
      for (const a of [1, n.dropdownChildAlpha, n.dropdownDisabledAlpha] as number[])
        expect(ratio(over(n.dropdownOnSurface as string, a, bg), bg)).toBeGreaterThanOrEqual(4.5);
  });
});
