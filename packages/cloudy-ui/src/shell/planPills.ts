// Port of libs:bottomnav PageTabs.kt planPills (AppTabsStyle.applyEqual): one width for every pill, sized to the longest label.
export type PillPlan = { textPx: number; pillPx: number; scrollable: boolean };

export function planPills(o: {
  availPx: number; count: number; longest: number; padPx: number; marginPx: number;
  startPx: number; minPx: number; stepPx: number; minChars: number; charWidth: (px: number) => number;
}): PillPlan {
  const { availPx, count, longest, padPx, marginPx, startPx, minPx, stepPx, minChars, charWidth } = o;
  if (count <= 0 || availPx <= 0) return { textPx: startPx, pillPx: 0, scrollable: true };
  const perTab = availPx / count;
  const budget = perTab - padPx - marginPx;
  if (budget <= 0) return { textPx: startPx, pillPx: 0, scrollable: true };
  let size = startPx;
  let chars = longest;
  for (;;) {
    if (chars * charWidth(size) <= budget) break;
    if (size > minPx) { size = Math.max(minPx, size - stepPx); continue; }
    chars = Math.max(minChars + 1, Math.floor(budget / charWidth(size)));
    break;
  }
  const pill = chars * charWidth(size) + padPx;
  const overflows = pill + marginPx > perTab;
  return { textPx: size, pillPx: overflows ? pill : Math.min(pill, perTab - marginPx), scrollable: overflows };
}

/** The label a pill shows for a char budget: the whole label, or its first (n-1) characters and an ellipsis. */
export function fitLabel(label: string, chars: number): string {
  return label.length <= chars ? label : label.slice(0, Math.max(1, chars - 1)) + '…';
}
