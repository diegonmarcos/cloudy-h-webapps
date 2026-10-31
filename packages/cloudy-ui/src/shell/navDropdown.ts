// The page-list dropdown's height rule (libs:bottomnav NavDropdownSizing.kt): as tall as its list, capped at the room the window
// leaves below its anchor (window height, minus the top inset or the anchor's bottom, whichever is lower, minus the bottom inset,
// minus tokens.nav.dropdownScreenMargin), floored at tokens.nav.dropdownMinHeight; it scrolls only past the cap. Pure. The
// dropdowns apply the SAME rule in CSS (DROPDOWN_CAP_CSS below, no JS in the shell): 100dvh follows rotation and split screen,
// env(safe-area-inset-bottom) is the bottom bar, the margin and floor are the generated token variables.
import { tokens } from '../../tokens/tokens';

export type DropdownRoom = { windowHeight: number; anchorBottom: number; insetTop?: number; insetBottom?: number };
type T = { dropdownScreenMargin: number; dropdownMinHeight: number };

export function dropdownMaxHeight(r: DropdownRoom, t: T = tokens.nav): number {
  const top = r.insetTop ?? 0, bottom = r.insetBottom ?? 0, margin = t.dropdownScreenMargin;
  const whole = Math.max(0, r.windowHeight - top - bottom - margin);
  const below = r.windowHeight - Math.max(r.anchorBottom, top) - bottom - margin;
  return Math.min(whole, Math.max(Math.min(t.dropdownMinHeight, whole), below));
}

export const dropdownHeight = (content: number, cap: number): number => Math.min(content, cap);
export const dropdownScrolls = (content: number, cap: number): boolean => content > cap;


/** The rule as CSS, for a dropdown whose top edge is [top] below the viewport's top: what FleetFirstRow and FleetSecondRows use
 *  (navDropdown.test.ts pins both to it, so the rule cannot drift between the tested function and the drawn dropdowns). */
export const dropdownCapCss = (top: string): string =>
  `max-height: max(var(--nav-dropdown-min-height), calc(100dvh - ${top} - env(safe-area-inset-bottom, 0px) - var(--nav-dropdown-screen-margin)));`;
