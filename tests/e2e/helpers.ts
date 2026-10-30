import type { Page } from '@playwright/test';

export const BASE = '/cloud-webapps';
export const isTablet = (name: string) => name.startsWith('tablet');
/** A real touch swipe (touchstart -> touchend 120 ms later), what gestures.ts listens to. */
export async function swipe(page: Page, selector: string, dx: number) {
  await page.evaluate(async ([sel, dx]) => {
    const el = document.querySelector(sel as string) as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const t = (cx: number) => new Touch({ identifier: 1, target: el, clientX: cx, clientY: y });
    el.dispatchEvent(new TouchEvent('touchstart', { touches: [t(x)], changedTouches: [t(x)], bubbles: true }));
    await new Promise((res) => setTimeout(res, 120));
    el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t(x + (dx as number))], bubbles: true }));
  }, [selector, dx] as const);
}
