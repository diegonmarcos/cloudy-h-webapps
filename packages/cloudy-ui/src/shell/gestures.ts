// Gestures (#1320 B.2): a horizontal swipe on content walks the page tabs (ui.swipe_walk), an edge swipe opens the drawer.
export const SWIPE_MIN_PX = 48;
export const SWIPE_MIN_VELOCITY = 0.3; // px per ms
export const EDGE_PX = 20;

/** -1 = previous tab, 1 = next tab, 0 = not a tab swipe. A mostly vertical drag is a scroll, never a swipe. */
export function swipeDirection(dx: number, dy: number, ms: number): -1 | 0 | 1 {
  if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return 0;
  if (Math.abs(dx) / Math.max(ms, 1) < SWIPE_MIN_VELOCITY) return 0;
  return dx < 0 ? 1 : -1;
}

/** A drag that starts within EDGE_PX of the left edge and travels right opens the drawer. */
export function isEdgeOpen(startX: number, dx: number, dy: number): boolean {
  return startX <= EDGE_PX && dx >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy);
}

/** Wire the two gestures on [el]. Touch only: a mouse never swipes. */
export function swipe(el: HTMLElement, opts: { onTab: (dir: -1 | 1) => void; onEdge: () => void }) {
  let x = 0, y = 0, t = 0, on = false;
  const down = (e: TouchEvent) => { const p = e.touches[0]; x = p.clientX; y = p.clientY; t = performance.now(); on = true; };
  const up = (e: TouchEvent) => {
    if (!on) return; on = false;
    const p = e.changedTouches[0]; const dx = p.clientX - x, dy = p.clientY - y;
    if (isEdgeOpen(x, dx, dy)) return opts.onEdge();
    const d = swipeDirection(dx, dy, performance.now() - t);
    if (d) opts.onTab(d);
  };
  el.addEventListener('touchstart', down, { passive: true });
  el.addEventListener('touchend', up, { passive: true });
  return { destroy() { el.removeEventListener('touchstart', down); el.removeEventListener('touchend', up); } };
}
