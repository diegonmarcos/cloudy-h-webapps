// The nav UI choice of the page, per app, persisted in localStorage (the web twin of NavUiPrefs). A `?nav=clean|classic` query is a
// one-off override that is not saved (links, screenshots, the e2e walk).
import { DEFAULT_NAV_UI, NAV_UI_KEY, NAV_UI_MODES, parseNavUi, type NavUiMode, type NavUiSettings } from './navUi';

// A hand-rolled store (the Svelte store contract: subscribe/set), so the shell's up-front JS does not carry svelte/store (budget).
const subscribers = new Set<(v: NavUiSettings) => void>();
let current: NavUiSettings = DEFAULT_NAV_UI;
export const navUi = {
  subscribe(fn: (v: NavUiSettings) => void): () => void { fn(current); subscribers.add(fn); return () => { subscribers.delete(fn); }; },
  set(v: NavUiSettings): void { current = v; subscribers.forEach((fn) => fn(v)); },
};

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Load [appId]'s choice over its declared [declared] default; returns the settings now in force. */
export function loadNavUi(appId: string, declared: NavUiSettings, storage: Store | null = typeof localStorage === 'undefined' ? null : localStorage, search = typeof location === 'undefined' ? '' : location.search): NavUiSettings {
  const saved = storage?.getItem(NAV_UI_KEY(appId));
  let cur = saved == null ? declared : parseNavUi(saved, declared);
  const q = new URLSearchParams(search).get('nav');
  if (q && NAV_UI_MODES.includes(q as NavUiMode)) cur = { ...cur, mode: q as NavUiMode };
  navUi.set(cur);
  return cur;
}

/** Save a change of [appId]'s choice. Choosing the declared default clears the entry, as the Android card does. */
export function saveNavUi(appId: string, declared: NavUiSettings, next: NavUiSettings, storage: Store | null = typeof localStorage === 'undefined' ? null : localStorage): void {
  navUi.set(next);
  if (!storage) return;
  if (next.mode === declared.mode && next.scrollHide === declared.scrollHide) storage.removeItem(NAV_UI_KEY(appId));
  else storage.setItem(NAV_UI_KEY(appId), JSON.stringify(next));
}
