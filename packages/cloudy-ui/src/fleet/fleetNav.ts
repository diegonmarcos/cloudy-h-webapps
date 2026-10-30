// Ports of libs:ui-nav-bars navigation logic (#1154), pure: titleHierarchy (NavBarTopFirstRow.kt), titleNav + fitCrumbs
// (Breadcrumb.kt), railLabel + sideMenuItems (bottomnav NavModes.kt). Pages carry an href instead of a callback.
export type FPage = { id: string; label?: string; icon?: string; action?: string; pages?: FPage[] };
export type FSection = { id: string; label?: string; icon?: string; pages?: FPage[] };
export type Entry = { id: string; label: string; depth: number; sectionId: string; selected: boolean; action: string };
export type Crumb = { label: string; target: Entry | null };

const lab = (p: { id: string; label?: string }) => p.label ?? p.id;

/** NavSection.path: the chain of pages from the section down to [pageId] (empty when unknown). */
function pathTo(pages: FPage[], id: string | null): FPage[] {
  if (!id) return [];
  for (const p of pages) {
    if (p.id === id) return [p];
    const sub = pathTo(p.pages ?? [], id);
    if (sub.length) return [p, ...sub];
  }
  return [];
}

export function titleHierarchy(section: FSection, currentPageId: string | null): Entry[] {
  const onPath = new Set(pathTo(section.pages ?? [], currentPageId).map((p) => p.id));
  const out: Entry[] = [{ id: section.id, label: lab(section), depth: 0, sectionId: section.id, selected: onPath.size === 0, action: '' }];
  const walk = (pages: FPage[], depth: number) => {
    for (const p of pages) {
      out.push({ id: p.id, label: lab(p), depth, sectionId: section.id, selected: onPath.has(p.id), action: p.action ?? '' });
      walk(p.pages ?? [], depth + 1);
    }
  };
  walk(section.pages ?? [], 1);
  return out;
}

export function titleNav(appName: string, title: string, hierarchy: Entry[], sections: FSection[] = [], leaf: string | null = null) {
  const section = hierarchy.find((e) => e.depth === 0);
  const peers: Entry[] = sections.map((s) => ({ id: s.id, label: lab(s), depth: 0, sectionId: s.id, selected: s.id === section?.sectionId, action: '' }));
  const root = peers[0] ?? section ?? null;
  const crumbs: Crumb[] = [{ label: appName, target: root }];
  if (!section) {
    if (title.trim() && title !== appName) crumbs.push({ label: title, target: null });
    if (leaf?.trim()) crumbs.push({ label: leaf, target: null });
    return { crumbs, related: peers, currentDepth: 0 };
  }
  const path = hierarchy.filter((e) => e.depth > 0 && e.selected);
  crumbs.push({ label: section.label, target: section });
  for (const e of path) crumbs.push({ label: e.label, target: e });
  if (leaf?.trim()) crumbs.push({ label: leaf, target: null });
  const cur = path[path.length - 1] ?? section;
  const ci = hierarchy.indexOf(cur);
  const depth = cur.depth;
  let siblings: Entry[];
  if (depth === 0) siblings = peers.length ? peers : [section];
  else {
    let p = ci - 1;
    while (p >= 0 && hierarchy[p].depth >= depth) p--;
    siblings = [];
    for (let k = p + 1; k < hierarchy.length && hierarchy[k].depth > hierarchy[p].depth; k++) if (hierarchy[k].depth === depth) siblings.push(hierarchy[k]);
  }
  const children: Entry[] = [];
  for (let i = ci + 1; i < hierarchy.length && hierarchy[i].depth > depth; i++) if (hierarchy[i].depth === depth + 1) children.push(hierarchy[i]);
  return { crumbs, related: [...siblings, ...children], currentDepth: depth };
}

/** The path as one line that fits: leading segments give way to "…" so the end of the path stays. */
export function fitCrumbs(labels: string[], fits: (line: string) => boolean): string {
  if (!labels.length) return '';
  for (let drop = 0; drop < labels.length; drop++) {
    const line = [...(drop > 0 ? ['…'] : []), ...labels.slice(drop)].join(' / ');
    if (fits(line)) return line;
  }
  return labels[labels.length - 1];
}

export function railLabel(label: string, n = 3): string {
  return Array.from(label.trim()).slice(0, n).join('');
}

/** NavBarBottom: one cell of a bar [barWidth] wide holding [count] items: CELL, or less when crowded. */
export function cellWidth(barWidth: number, count: number, cell = 56, innerPad = 8): number {
  return count <= 0 ? cell : Math.min(cell, (barWidth - innerPad * 2) / count);
}
