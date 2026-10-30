// The nav UI declaration (libs:bottomnav NavUi.kt, generated into tokens.nav.ui): Classic / Clean, the Clean drawer's rows and icons,
// the transparent first row, scroll-hide. Pure, so the chrome's rules are tested without a DOM. Every name and size comes from the
// generated tokens; nothing here restates a number.
import { tokens } from '../../tokens/tokens';

export type NavUiMode = 'classic' | 'clean';
export type DrawerRowKind = 'page_dropdown' | 'actions' | 'sub_page_dropdown';
export type NavQuickAction = 'ai' | 'profile' | 'settings';
export type NavUiSettings = { mode: NavUiMode; scrollHide: boolean };

const U = tokens.nav.ui;
export const NAV_UI_MODES = U.modes.split(',') as NavUiMode[];
export const CLEAN_DRAWER_ROWS = U.cleanDrawerRows.split(',') as DrawerRowKind[];
export const CLEAN_DRAWER_ACTIONS = U.cleanDrawerActions.split(',') as NavQuickAction[];
export const DEFAULT_NAV_UI: NavUiSettings = { mode: U.defaultMode as NavUiMode, scrollHide: U.scrollHideDefault === 1 };
/** NavUiDecl.CONFIGS_UI_LABEL: the entry that opens the Configs > UI card. */
export const CONFIGS_UI_LABEL = 'Configs ▸ UI';

/** CSS colour (#rrggbbaa / #rgba / transparent) has no opacity at all. */
export const isTransparent = (css: string): boolean => /^(transparent|#[0-9a-f]{6}00|#[0-9a-f]{3}0)$/i.test(css.trim());

export type NavChromePlan = {
  mode: NavUiMode; topRowTransparent: boolean; hamburger: boolean; secondRow: boolean;
  drawerRows: DrawerRowKind[]; drawerActions: NavQuickAction[]; bottomLabels: boolean;
};

/** NavUiDecl.plan: what a mode draws. The first row is transparent in EVERY mode (tokens.nav.topRowFill). */
export function navChromePlan(mode: NavUiMode, topRowFill: string = tokens.nav.topRowFill): NavChromePlan {
  const clean = mode === 'clean';
  return {
    mode, topRowTransparent: isTransparent(topRowFill), hamburger: clean, secondRow: !clean,
    drawerRows: clean ? [...CLEAN_DRAWER_ROWS] : [], drawerActions: clean ? [...CLEAN_DRAWER_ACTIONS] : [], bottomLabels: !clean,
  };
}

// ── scroll-hide: a downward scroll hides ALL bars until an upward scroll reveals them (ChromeScrollPolicy.Hide / Pinned) ──
export type ChromeState = 'shown' | 'hidden';

/** The step on a scroll [dy] (> 0: reading down). Scroll-hide off pins the bars. No movement changes nothing. */
export function scrollHideStep(state: ChromeState, dy: number, scrollHide: boolean): ChromeState {
  if (!scrollHide) return 'shown';
  if (dy > 0) return 'hidden';
  if (dy < 0) return 'shown';
  return state;
}

// ── persistence (the `nav_ui` store of the app): fail-soft like the Android prefs ──
export const NAV_UI_KEY = (appId: string) => `nav_ui:${appId}`;

export function parseNavUi(raw: string | null | undefined, fallback: NavUiSettings = DEFAULT_NAV_UI): NavUiSettings {
  try {
    const o = JSON.parse(raw ?? '') as { mode?: unknown; scrollHide?: unknown };
    return {
      mode: NAV_UI_MODES.includes(o.mode as NavUiMode) ? (o.mode as NavUiMode) : fallback.mode,
      scrollHide: typeof o.scrollHide === 'boolean' ? o.scrollHide : fallback.scrollHide,
    };
  } catch { return fallback; }
}

/** build.json::ui.nav_ui as the generated nav data carries it ({mode, scroll_hide}); blank or unknown is the default. */
export function declaredNavUi(decl: { mode?: string; scroll_hide?: boolean } | null | undefined): NavUiSettings {
  return {
    mode: NAV_UI_MODES.includes(decl?.mode as NavUiMode) ? (decl!.mode as NavUiMode) : DEFAULT_NAV_UI.mode,
    scrollHide: typeof decl?.scroll_hide === 'boolean' ? decl.scroll_hide : DEFAULT_NAV_UI.scrollHide,
  };
}
