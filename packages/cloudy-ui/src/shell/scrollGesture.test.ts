import { describe, expect, it } from 'vitest';
import { gestureDown, gestureUp, scrollHideGestureStep as step, scrollHideStart } from './navUi';

describe('scroll-hide per gesture (NavUi.kt chromeGestureStep)', () => {
  const hiddenByTouch = () => step(gestureDown(scrollHideStart()), 40, true);

  it('a touch scrolling down hides the bars', () => { expect(hiddenByTouch().chrome).toBe('hidden'); });

  it('same-gesture reversal does not restore (finger held, then its momentum)', () => {
    const held = step(hiddenByTouch(), -40, true);
    expect(held.chrome).toBe('hidden');
    const fling = step(gestureUp(held), -120, true);
    expect(fling.chrome).toBe('hidden');
  });

  it('release, then a new upward gesture restores', () => {
    const next = step(gestureDown(gestureUp(hiddenByTouch())), -10, true);
    expect(next.chrome).toBe('shown');
    expect(next.latch).toBeNull();
  });

  it('a new downward gesture keeps the bars hidden, and its own reversal cannot restore', () => {
    const down = step(gestureDown(gestureUp(hiddenByTouch())), 25, true);
    expect(down.chrome).toBe('hidden');
    expect(step(down, -25, true).chrome).toBe('hidden');
  });

  it('a second touchstart inside the same gesture is not a new gesture', () => {
    const m = hiddenByTouch();
    expect(step(gestureDown(m), -10, true).chrome).toBe('hidden');
  });

  it('without a touch (mouse wheel) an upward scroll is a new gesture and restores', () => {
    const hid = step(scrollHideStart(), 30, true);
    expect(hid.chrome).toBe('hidden');
    expect(step(hid, -30, true).chrome).toBe('shown');
  });

  it('scroll-hide off pins the bars', () => {
    expect(step(gestureDown(scrollHideStart()), 40, false).chrome).toBe('shown');
  });
});
