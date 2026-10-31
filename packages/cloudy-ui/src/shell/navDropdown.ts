// The page-list dropdown's height rule (libs:bottomnav NavDropdownSizing.kt): as tall as its list, capped at the room the window
// leaves below its anchor (window height, minus the top inset or the anchor's bottom, whichever is lower, minus the bottom inset,
// minus tokens.nav.dropdownScreenMargin), floored at tokens.nav.dropdownMinHeight; it scrolls only past the cap. Pure; the
// first row re-measures on open and on every window resize (rotation, split screen). Every size comes from the generated tokens.
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
