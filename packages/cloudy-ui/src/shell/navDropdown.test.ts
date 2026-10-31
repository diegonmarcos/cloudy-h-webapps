import { describe, expect, it } from 'vitest';
import { tokens } from '../../tokens/tokens';
import { readFileSync } from 'node:fs';
import { dropdownCapCss, dropdownHeight, dropdownMaxHeight, dropdownScrolls } from './navDropdown';

const M = tokens.nav.dropdownScreenMargin, MIN = tokens.nav.dropdownMinHeight;
const portrait = { windowHeight: 800, anchorBottom: 80, insetTop: 24, insetBottom: 48 };

describe('page-list dropdown sizing (NavDropdownSizing)', () => {
  it('reads its margin and floor from the generated tokens', () => { expect([M, MIN]).toEqual([16, 96]); });
  it('caps at the window below the anchor minus the bottom inset and the margin', () => {
    expect(dropdownMaxHeight(portrait)).toBe(800 - 80 - 48 - M);
  });
  it('content smaller than the cap: its own height, no scroll, no empty space', () => {
    const cap = dropdownMaxHeight(portrait);
    expect(dropdownHeight(200, cap)).toBe(200);
    expect(dropdownScrolls(200, cap)).toBe(false);
  });
  it('content larger than the cap: the cap, scrolling, more than the old fixed 520 on a tall window', () => {
    const cap = dropdownMaxHeight(portrait);
    expect(dropdownHeight(3000, cap)).toBe(cap);
    expect(dropdownScrolls(3000, cap)).toBe(true);
    expect(dropdownScrolls(cap, cap)).toBe(false);
    expect(dropdownHeight(3000, dropdownMaxHeight({ windowHeight: 1400, anchorBottom: 80 }))).toBeGreaterThan(520);
  });
  it('rotation re-caps: landscape has less room and the list stays on screen', () => {
    const land = dropdownMaxHeight({ windowHeight: 400, anchorBottom: 70, insetTop: 24, insetBottom: 0 });
    expect(land).toBe(400 - 70 - M);
    expect(land).toBeLessThan(dropdownMaxHeight(portrait));
    expect(70 + dropdownHeight(3000, land)).toBeLessThanOrEqual(400 - M);
    expect(dropdownScrolls(330, land)).toBe(true);
    expect(dropdownScrolls(330, dropdownMaxHeight(portrait))).toBe(false);
  });
  it('split screen with a low anchor keeps the floor; a tiny window never goes negative', () => {
    expect(dropdownMaxHeight({ windowHeight: 300, anchorBottom: 250 })).toBe(MIN);
    expect(dropdownMaxHeight({ windowHeight: 50, anchorBottom: 40, insetTop: 24, insetBottom: 20 })).toBe(0);
    expect(dropdownMaxHeight({ windowHeight: 800, anchorBottom: 0, insetTop: 24, insetBottom: 48 })).toBe(800 - 24 - 48 - M);
  });

  // The drawn dropdowns apply the rule in CSS: both carry exactly dropdownCapCss, and that CSS computes what the function does.
  const src = (f: string) => readFileSync(new URL(f, import.meta.url), 'utf8');
  it('the first row and the group index draw the same cap, from the generated token variables', () => {
    expect(src('../fleet/FleetFirstRow.svelte')).toContain(dropdownCapCss('calc(var(--fleet-top1-height) + 4px)'));
    expect(src('../fleet/FleetSecondRows.svelte')).toContain(dropdownCapCss('var(--dd-top)'));
  });
  it('the CSS cap equals dropdownMaxHeight (portrait, landscape, low anchor)', () => {
    const evalCss = (H: number, top: number, bottom: number) => {
      const e = dropdownCapCss(String(top)).replace(/^max-height: |;$/g, '')
        .replace('var(--nav-dropdown-min-height)', String(MIN)).replace('var(--nav-dropdown-screen-margin)', String(M))
        .replace('env(safe-area-inset-bottom, 0px)', String(bottom)).replace('100dvh', String(H)).replaceAll('calc(', '(').replace('max(', 'Math.max(');
      return Function(`return ${e}`)() as number;
    };
    for (const [H, top, bottom] of [[800, 80, 48], [400, 70, 0], [300, 250, 0], [1400, 80, 0]])
      expect(evalCss(H, top, bottom)).toBe(dropdownMaxHeight({ windowHeight: H, anchorBottom: top, insetBottom: bottom }));
  });
});
