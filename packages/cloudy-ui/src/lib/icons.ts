// Icon names -> sprite symbol refs. SuperApp declarations name drawables (ic_*); fleet apps name UiIcons catalog entries
// (snake_case Material names or semantic names). An unknown name draws the catalog FALLBACK (UiIcons.FALLBACK), never nothing.
import saUrl from '../../icons/sprite-sa.svg?url';
import uiUrl from '../../icons/sprite-ui.svg?url';
import icons from '../../icons/icons.json';

const SA = new Set<string>(icons.sa);
const UI = icons.ui as Record<string, string>;
export function iconHref(name: string | null | undefined): string {
  if (name && SA.has(name)) return `${saUrl}#sa-${name}`;
  if (name === 'assistant') return `${uiUrl}#brand-assistant`;
  if (name && UI[name]) return `${uiUrl}#mi-${UI[name]}`;
  if (name && SA.has(`ic_${name}`)) return `${saUrl}#sa-ic_${name}`;
  return `${uiUrl}#mi-${icons.fallback}`;
}

/** A fleet app's nav glyph (libs:ui-icons UiIcons): the catalog only — a name it does not hold draws FALLBACK, never a
 *  SuperApp drawable (UiIcons.icon(name) ?: FALLBACK). `filled:<name>` = an Icons.Filled glyph the first row draws. */
export function fleetIconHref(name: string | null | undefined): string {
  if (name?.startsWith('filled:')) return `${uiUrl}#mf-${name.slice(7)}`;
  if (name === 'assistant') return `${uiUrl}#brand-assistant`;
  if (name && UI[name]) return `${uiUrl}#mi-${UI[name]}`;
  return `${uiUrl}#mi-${icons.fallback}`;
}
