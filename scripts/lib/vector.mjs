// Android VectorDrawable XML -> SVG body (paths + groups), monochrome: every painted fill/stroke becomes currentColor,
// because the launcher tints its tile glyphs with the theme's text_primary (LauncherTiles.kt: tint = p.textPrimary).
// Ported from a_Portals/cloud-superapp/scripts/gen-nav.mjs vectorToSvg (#1320 D.2).
const attr = (tag, name) => (new RegExp(`android:${name}="([^"]*)"`).exec(tag) ?? [])[1];
const paint = (c) => c && !/^#0{8}$|^#00[0-9a-fA-F]{6}$/.test(c) && c !== '@android:color/transparent';

/** @returns {{ viewBox: string, body: string } | null} */
export function vectorBody(xml) {
  xml = xml.replace(/<!--[\s\S]*?-->/g, '');
  const root = /<vector\b[^>]*>/.exec(xml)?.[0];
  if (!root) return null;
  const vw = attr(root, 'viewportWidth') ?? '24', vh = attr(root, 'viewportHeight') ?? '24';
  let body = '';
  const re = /<group\b[^>]*?(\/?)>|<\/group>|<path\b[\s\S]*?(?:\/>|<\/path>)/g;
  for (let m; (m = re.exec(xml));) {
    const t = m[0];
    if (t.startsWith('</group')) { body += '</g>'; continue; }
    if (t.startsWith('<group')) {
      if (m[1]) continue;
      const tx = attr(t, 'translateX') ?? 0, ty = attr(t, 'translateY') ?? 0;
      const sx = attr(t, 'scaleX') ?? 1, sy = attr(t, 'scaleY') ?? 1, r = attr(t, 'rotation');
      const px = attr(t, 'pivotX') ?? 0, py = attr(t, 'pivotY') ?? 0;
      const ident = +tx === 0 && +ty === 0 && +sx === 1 && +sy === 1 && !r;
      body += ident ? '<g>' : `<g transform="translate(${tx} ${ty})${r ? ` rotate(${r} ${px} ${py})` : ''} translate(${px} ${py}) scale(${sx} ${sy}) translate(${-px} ${-py})">`;
      continue;
    }
    const d = attr(t, 'pathData');
    if (!d) continue;
    const fill = attr(t, 'fillColor') ?? (/<aapt:attr name="android:fillColor"/.test(t) ? '#fff' : null);
    const stroke = attr(t, 'strokeColor');
    const a = [`d="${d.replace(/\s+/g, ' ').trim()}"`];
    if (!paint(fill)) a.push('fill="none"');
    if (paint(stroke)) a.push('stroke="currentColor"', `stroke-width="${attr(t, 'strokeWidth') ?? 1}"`);
    if (attr(t, 'fillType') === 'evenOdd') a.push('fill-rule="evenodd"');
    if (attr(t, 'strokeLineCap')) a.push(`stroke-linecap="${attr(t, 'strokeLineCap')}"`);
    if (attr(t, 'strokeLineJoin')) a.push(`stroke-linejoin="${attr(t, 'strokeLineJoin')}"`);
    const fa = attr(t, 'fillAlpha');
    if (fa && fa !== '1' && fa !== '1.0') a.push(`fill-opacity="${fa}"`);
    body += `<path ${a.join(' ')}/>`;
  }
  return { viewBox: `0 0 ${vw} ${vh}`, body };
}

/** Compose `Icons.Outlined.<Ident>` -> the Material Icons file name (CalendarMonth -> calendar_month, Inventory2 -> inventory_2). */
export const snake = (ident) => ident.replace(/^_/, '').replace(/([a-z])([A-Z0-9])/g, '$1_$2').replace(/([0-9])([A-Z])/g, '$1_$2').toLowerCase();
