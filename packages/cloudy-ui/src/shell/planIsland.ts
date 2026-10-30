// Port of libs:bottomnav BottomNavBar.kt planIsland / fullSizeCell (#a11y FIT), value for value. Units: dp = CSS px.
import { tokens } from '../../tokens/tokens';

export type NavTokenSet = {
  minTouchTarget: number; minCellWidth: number; fitSideMargin: number; minSideMargin: number; minEndInset: number; fitMinCell: number;
};
export type IslandPlan = { fitted: boolean; islandWidth: number; endInset: number; cell: number; scale: number; count: number };

const EQUAL_CELLS_BOTTOM = tokens.nav.limits.EQUAL_CELLS_BOTTOM;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** The narrowest equal cell that still draws full-size type: the touch floor up to EQUAL_CELLS_BOTTOM items, minCellWidth above. */
export function fullSizeCell(count: number, t: NavTokenSet = tokens.nav): number {
  return count > EQUAL_CELLS_BOTTOM ? Math.max(t.minCellWidth, t.minTouchTarget) : t.minTouchTarget;
}

/** How the island lays out [count] cells in [maxWidth]: always every item, in equal cells, never a scroll. */
export function planIsland(maxWidth: number, widthFraction: number, endInset: number, count: number, t: NavTokenSet = tokens.nav): IslandPlan {
  const classic = maxWidth * widthFraction;
  if (count <= 0) return { fitted: false, islandWidth: classic, endInset, cell: 0, scale: 1, count: 0 };
  const equal = (classic - endInset * 2) / count;
  const full = fullSizeCell(count, t);
  if (equal >= full) return { fitted: false, islandWidth: classic, endInset, cell: equal, scale: 1, count };
  // 1. widen toward full-size cells, the island still floating clear of the sides.
  const roomy = Math.max(classic, maxWidth - t.fitSideMargin * 2);
  let island = clamp(full * count + endInset * 2, classic, roomy);
  // 2. under the touch floor: widen on, only as far as 48dp needs, down to the side-margin floor.
  if ((island - endInset * 2) / count < t.minTouchTarget) {
    const widest = Math.max(roomy, maxWidth - t.minSideMargin * 2);
    island = clamp(t.minTouchTarget * count + endInset * 2, island, widest);
  }
  // 3. still short: give the end insets up, down to their floor.
  const end = (island - endInset * 2) / count >= t.minTouchTarget ? endInset
    : clamp((island - t.minTouchTarget * count) / 2, Math.min(t.minEndInset, endInset), endInset);
  const cell = (island - end * 2) / count;
  // 4. the type follows the cell.
  const span = full - t.fitMinCell;
  const scale = span <= 0 ? 1 : clamp((cell - t.fitMinCell) / span, 0, 1);
  return { fitted: true, islandWidth: island, endInset: end, cell, scale, count };
}

export const lerp = (min: number, max: number, f: number) => min + (max - min) * f;
