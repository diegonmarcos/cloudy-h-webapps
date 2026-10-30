import { describe, expect, it } from 'vitest';
import { planIsland, fullSizeCell } from './planIsland';
import { tokens } from '../../tokens/tokens';

// The cases BottomNavBar.kt documents for planIsland (and NavTokensTest pins on Android), on a 360dp phone.
const plan = (w: number, n: number) => planIsland(w, tokens.nav.widthFraction, tokens.nav.endInset, n, tokens.nav);

describe('planIsland (port of libs:bottomnav)', () => {
  it('5 items on 360dp: the classic island, equal 55.2dp cells, full-size type', () => {
    const p = plan(360, 5);
    expect(p.fitted).toBe(false);
    expect(p.islandWidth).toBeCloseTo(288, 5);
    expect(p.cell).toBeCloseTo(55.2, 5);
    expect(p.scale).toBe(1);
  });
  it('6 items: a 344dp island, 55.3dp cells, type at 94%', () => {
    const p = plan(360, 6);
    expect(p.fitted).toBe(true);
    expect(p.islandWidth).toBeCloseTo(344, 5);
    expect(p.cell).toBeCloseTo(55.33, 1);
    expect(p.scale).toBeCloseTo(0.944, 2);
  });
  it('7 items: 348dp, 48dp cells', () => {
    const p = plan(360, 7);
    expect(p.islandWidth).toBeCloseTo(348, 5);
    expect(p.cell).toBeCloseTo(48, 5);
  });
  it('8 items fitted at 360dp: 356dp island, 2dp end insets, 44dp cells, 20dp icons, 10sp labels (scale 0)', () => {
    const p = plan(360, 8);
    expect(p.islandWidth).toBeCloseTo(356, 5);
    expect(p.endInset).toBeCloseTo(2, 5);
    expect(p.cell).toBeCloseTo(44, 5);
    expect(p.scale).toBe(0);
    const icon = tokens.nav.fitIconSize + (tokens.nav.iconSize - tokens.nav.fitIconSize) * p.scale;
    const label = tokens.nav.fitLabelTextSize + (tokens.nav.labelTextSize - tokens.nav.fitLabelTextSize) * p.scale;
    expect([icon, label]).toEqual([20, 10]);
  });
  it('the 412dp Pixel 7 draws the classic 5-item island at 80%', () => {
    const p = plan(412, 5);
    expect(p.fitted).toBe(false);
    expect(p.islandWidth).toBeCloseTo(329.6, 5);
  });
  it('full-size cell: 48 up to 5 items, 56 above', () => {
    expect(fullSizeCell(5)).toBe(48);
    expect(fullSizeCell(6)).toBe(56);
  });
});
