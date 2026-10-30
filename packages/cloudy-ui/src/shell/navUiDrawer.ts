// The Clean drawer's content (libs:bottomnav cleanDrawerModel). Its own module: only the lazy drawer chunk loads it.
import { CLEAN_DRAWER_ACTIONS, CLEAN_DRAWER_ROWS, type DrawerRowKind, type NavQuickAction } from './navUi';

export type DrawerEntry = { id: string; label: string; href: string | null; selected: boolean; depth: number };
export type CleanDrawerModel = {
  rows: DrawerRowKind[]; pageName: string; pages: DrawerEntry[]; actions: NavQuickAction[]; subPages: DrawerEntry[]; subPageName: string;
};
type PageLike = { id: string; label: string; href: string | null };

/** Row 1: the bottom pages (the open one named); row 2: the icons; row 3: the open page's child pages, absent when it has none. */
export function cleanDrawerModel(bottom: PageLike[], section: string | null, children: PageLike[], selectedChild: string | null): CleanDrawerModel {
  const pages = bottom.map((b) => ({ ...b, selected: b.id === section, depth: 0 }));
  const subPages = children.map((c) => ({ ...c, selected: c.id === selectedChild, depth: 0 }));
  const face = subPages.find((s) => s.selected) ?? subPages[0];
  return {
    rows: CLEAN_DRAWER_ROWS.filter((r) => r !== 'sub_page_dropdown' || subPages.length > 0),
    pageName: pages.find((p) => p.selected)?.label ?? '',
    pages, actions: [...CLEAN_DRAWER_ACTIONS], subPages, subPageName: face?.label ?? '',
  };
}
