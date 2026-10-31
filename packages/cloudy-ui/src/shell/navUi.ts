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

/**
 * Per-gesture scroll-hide (NavUi.kt chromeGestureStep): the touch that hid the bars is latched, and no upward scroll of that same
 * gesture (finger still down, or the momentum it threw: a fling is part of its gesture) shows them again. Only a NEW gesture
 * (touchend / pointerup, then touchstart / pointerdown) restores them, on its first upward scroll; a new downward gesture keeps
 * them hidden. Without a touch ever seen (mouse wheel, keyboard) an upward scroll after the last one counts as a new gesture.
 */
export type ScrollHideMachine = { chrome: ChromeState; gesture: number; latch: number | null; touched: boolean; active: boolean };
export const scrollHideStart = (): ScrollHideMachine => ({ chrome: 'shown', gesture: 0, latch: null, touched: false, active: false });

/** touchstart / pointerdown (touch): a new gesture begins. */
export const gestureDown = (m: ScrollHideMachine): ScrollHideMachine => (m.active ? m : { ...m, gesture: m.gesture + 1, touched: true, active: true });
/** touchend / touchcancel / pointerup: the gesture ends; its momentum still belongs to it (the latch stays). */
export const gestureUp = (m: ScrollHideMachine): ScrollHideMachine => ({ ...m, active: false });

export function scrollHideGestureStep(m: ScrollHideMachine, dy: number, scrollHide: boolean): ScrollHideMachine {
  if (!scrollHide) return { ...m, chrome: 'shown', latch: null };
  const g = !m.touched && dy < 0 ? m.gesture + 1 : m.gesture;
  if (dy < 0 && m.latch !== null && m.latch === g) return m;
  const chrome = scrollHideStep(m.chrome, dy, true);
  const latch = chrome === 'shown' ? null : dy > 0 ? g : m.latch;
  return { ...m, gesture: g, chrome, latch };
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
