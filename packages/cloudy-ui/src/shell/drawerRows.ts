// HomeDrawerFragment.rows(): ui.main_menu entries, then one titled group per ui.home_groups group; a `section:` tile expands
// its pages as indented "└───" children with the declared group/subgroup headings. Pure, so it is tested without a DOM.
export type DrawerRow = { kind: 'title' | 'heading' | 'item'; label: string; icon?: string | null; target?: string; href?: string | null };
type Page = { id: string; label: string; icon?: string; hidden?: boolean; group?: string; subgroup?: string };
type Section = { id: string; label: string; icon?: string; pages?: Page[]; tiles_shared?: Tile[]; tiles_labs?: Tile[] };
type Tile = { id: string; label: string; icon?: string; target?: string };
type Group = { title: string; tiles?: Tile[]; tiles_from_bottom_nav?: boolean; tiles_from_section?: string; tiles_from_linktree?: string };
type MenuItem = { id?: string; label: string; icon?: string; action_type?: string };

export function drawerRows(sa: { main_menu?: MenuItem[]; home_groups?: Group[]; bottom_nav: string[]; sections: Section[] }): DrawerRow[] {
  const out: DrawerRow[] = [];
  const byId = new Map(sa.sections.map((s) => [s.id, s]));
  for (const a of sa.main_menu ?? []) out.push({ kind: 'item', label: a.label, icon: a.icon, target: `action:${a.action_type ?? ''}` });
  for (const g of sa.home_groups ?? []) {
    out.push({ kind: 'title', label: g.title });
    const tiles: Tile[] = [];
    if (g.tiles_from_bottom_nav) for (const id of sa.bottom_nav) { const s = byId.get(id); if (s) tiles.push({ id: `section:${id}`, label: s.label, icon: s.icon }); }
    if (g.tiles_from_section) {
      const [sid, part] = g.tiles_from_section.split('/');
      const s = byId.get(sid);
      const from = part ? (s as Record<string, unknown> | undefined)?.[`tiles_${part}`] : s?.tiles_shared;
      for (const t of (from as Tile[] | undefined) ?? []) tiles.push({ ...t, id: t.target ?? t.id });
    }
    tiles.push(...(g.tiles ?? []));
    for (const t of tiles) {
      const sec = t.id.startsWith('section:') ? byId.get(t.id.slice(8)) : undefined;
      out.push({ kind: 'item', label: t.label, icon: sec?.icon ?? t.icon, target: t.target ?? t.id });
      if (!sec) continue;
      const pad = '  '.repeat(6);
      let shownG = '', shownS = '';
      for (const p of sec.pages ?? []) {
        if (p.group && p.group !== shownG) { out.push({ kind: 'heading', label: pad + p.group.toUpperCase() }); shownG = p.group; shownS = ''; }
        if (p.subgroup && p.subgroup !== shownS) { out.push({ kind: 'heading', label: pad + pad + p.subgroup }); shownS = p.subgroup; }
        out.push({ kind: 'item', label: `      └─── ${p.label}`, icon: p.icon ?? null, target: `page:${sec.id}/${p.id}` });
      }
    }
  }
  return out;
}
