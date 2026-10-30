import { describe, expect, it } from 'vitest';
import { windowClass, twoPane } from './layout';

describe('window classes', () => {
  it('599 compact, 600 medium, 840 expanded', () => {
    expect(windowClass(599)).toBe('compact');
    expect(windowClass(600)).toBe('medium');
    expect(windowClass(839)).toBe('medium');
    expect(windowClass(840)).toBe('expanded');
  });
  it('sw600dp: Pixel 7 single pane in both orientations, Pixel Tablet two panes in both', () => {
    expect(twoPane(412, 915)).toBe(false);
    expect(twoPane(915, 412)).toBe(false);
    expect(twoPane(1280, 800)).toBe(true);
    expect(twoPane(800, 1280)).toBe(true);
  });
});
