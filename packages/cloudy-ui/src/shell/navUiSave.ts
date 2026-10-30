// Saving the nav UI choice (the Configs > UI card's onChange). Its own module: only the lazy dialog chunk loads it.
import { navUi } from './navUiStore';
import { NAV_UI_KEY, type NavUiSettings } from './navUi';

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Save a change of [appId]'s choice. Choosing the declared default clears the entry, as the Android card does. */
export function saveNavUi(appId: string, declared: NavUiSettings, next: NavUiSettings, storage: Store | null = typeof localStorage === 'undefined' ? null : localStorage): void {
  navUi.set(next);
  if (!storage) return;
  if (next.mode === declared.mode && next.scrollHide === declared.scrollHide) storage.removeItem(NAV_UI_KEY(appId));
  else storage.setItem(NAV_UI_KEY(appId), JSON.stringify(next));
}
