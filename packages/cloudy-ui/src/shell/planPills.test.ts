import { describe, expect, it } from 'vitest';
import { planPills, fitLabel } from './planPills';

// A monospace face: every character is 0.6em wide plus the strip's 0.08em tracking.
const charWidth = (px: number) => px * 0.68;
const base = { padPx: 28, marginPx: 6, startPx: 12, minPx: 8, stepPx: 1, minChars: 7, charWidth };

describe('planPills (port of PageTabs.kt)', () => {
  it('four short labels on a phone keep 12px text and fit', () => {
    const p = planPills({ ...base, availPx: 400, count: 4, longest: 8 });
    expect(p.textPx).toBe(12);
    expect(p.scrollable).toBe(false);
    expect(p.pillPx).toBeCloseTo(8 * 12 * 0.68 + 28, 5);
  });
  it('a crowded strip steps the font down toward 8px before dropping characters', () => {
    const p = planPills({ ...base, availPx: 400, count: 6, longest: 12 });
    expect(p.textPx).toBeLessThan(12);
    expect(p.textPx).toBeGreaterThanOrEqual(8);
  });
  it('only an overflow at the floor scrolls', () => {
    const p = planPills({ ...base, availPx: 360, count: 9, longest: 14 });
    expect(p.textPx).toBe(8);
    expect(p.scrollable).toBe(true);
  });
  it('labels ellipsize past their budget', () => {
    expect(fitLabel('SUBSCRIPTIONS', 8)).toBe('SUBSCRI…');
    expect(fitLabel('INBOX', 8)).toBe('INBOX');
  });
});
