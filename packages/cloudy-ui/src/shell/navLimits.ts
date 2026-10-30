import { tokens } from '../../tokens/tokens';

const { MIN_BOTTOM, MAX_BOTTOM } = tokens.nav.limits;
/** NavDecl's bottom-bar contract: MIN_BOTTOM..MAX_BOTTOM items; anything else is a declaration error, not a layout to draw. */
export function checkBottomNav(ids: readonly string[]): string[] {
  if (ids.length < MIN_BOTTOM || ids.length > MAX_BOTTOM) throw new Error(`bottom nav needs ${MIN_BOTTOM}..${MAX_BOTTOM} items, got ${ids.length}`);
  return [...ids];
}
