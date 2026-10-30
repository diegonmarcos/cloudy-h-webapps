import { describe, expect, it } from 'vitest';
import { swipeDirection, isEdgeOpen } from './gestures';

describe('gestures', () => {
  it('a fast leftward swipe goes to the next tab, rightward to the previous', () => {
    expect(swipeDirection(-120, 10, 200)).toBe(1);
    expect(swipeDirection(120, 10, 200)).toBe(-1);
  });
  it('short, slow or vertical drags are not tab swipes', () => {
    expect(swipeDirection(-30, 0, 50)).toBe(0);
    expect(swipeDirection(-100, 0, 1000)).toBe(0);
    expect(swipeDirection(-80, 120, 100)).toBe(0);
  });
  it('the drawer opens from the left edge only', () => {
    expect(isEdgeOpen(8, 90, 5)).toBe(true);
    expect(isEdgeOpen(60, 90, 5)).toBe(false);
  });
});
