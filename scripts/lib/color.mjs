// Pure colour/angle conversions shared by the generators (unit-tested in color.test.ts).
const fail = (m) => { throw new Error(m); };
/** Android #AARRGGBB / #RRGGBB / #ARGB -> CSS #rrggbb or #rrggbbaa (lower case). */
export function cssColor(a) {
  let h = a.replace('#', '').toLowerCase();
  if (h.length === 3) h = 'ff' + h.split('').map((c) => c + c).join('');
  if (h.length === 4) h = h.split('').map((c) => c + c).join('');
  if (h.length === 6) return '#' + h;
  if (h.length !== 8) fail(`bad colour ${a}`);
  const al = h.slice(0, 2), rgb = h.slice(2);
  return al === 'ff' ? '#' + rgb : '#' + rgb + al;
}
/** Android gradient angle (0 = left->right, 90 = bottom->top, counter-clockwise) -> CSS degrees (0 = to top, clockwise). */
export const cssAngle = (android) => (((90 - Number(android)) % 360) + 360) % 360;
