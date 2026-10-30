// Window size classes (#1320 B.8) and the SuperApp's own tablet rule (res/layout-sw600dp/view_content_panes.xml:
// smallest width >= 600dp = master 40% | 1dp divider | detail 60%, the bottom island stays). CSS px = dp.
export type WindowClass = 'compact' | 'medium' | 'expanded';

export function windowClass(width: number): WindowClass {
  if (width >= 840) return 'expanded';
  if (width >= 600) return 'medium';
  return 'compact';
}

/** sw600dp: the Android resource qualifier is the SMALLEST width, so a phone in landscape stays single-pane. */
export function twoPane(width: number, height: number): boolean {
  return Math.min(width, height) >= 600;
}

/** Mirror the class on <html data-layout> (+ data-panes) so CSS and container queries can follow it. */
export function trackLayout(win: Window = window): () => void {
  const apply = () => {
    const d = win.document.documentElement;
    d.dataset.layout = windowClass(win.innerWidth);
    d.dataset.panes = twoPane(win.innerWidth, win.innerHeight) ? '2' : '1';
  };
  apply();
  win.addEventListener('resize', apply);
  return () => win.removeEventListener('resize', apply);
}
