// Server-side (build-time) view models. nav.json / targets.json are GENERATED from the Android build.json ui declarations;
// they are read here, at prerender, so the client only ever receives the slice a page needs (__data.json), never the files.
import nav from '@cloudy/ui/nav/nav.json';
import targetsJson from '@cloudy/ui/nav/targets.json';
import routesJson from '@cloudy/ui/nav/routes.json';
import overlay from '@cloudy/ui/nav/nav-overlay.json';
import { titleHierarchy, titleNav, type Entry } from '@cloudy/ui/src/fleet/fleetNav.ts';
import { drawerRows, resolveTarget, joinBase, type ShellData, type Tab, type TileGroup, type TileItem } from '@cloudy/ui';
import content from '../../apps/superapp/data/sections-content.json';
import core from '../../apps/superapp/data/sections-core.json';
import linktree from '../../apps/superapp/data/linktree.json';
import shellSeed from '../../apps/superapp/data/shell.json';

type Page = { id: string; label: string; icon?: string; hidden?: boolean; action?: string; is_action?: boolean; pages?: Page[]; mirror_section?: string; mode?: string; url?: string; separator_before?: boolean; group?: string; subgroup?: string };
type Tile = { id?: string; label: string; icon?: string; target?: string; separator?: boolean; tint?: boolean };
type Section = Record<string, unknown> & { id: string; label: string; icon?: string; pages?: Page[]; tile_groups?: { title: string; tiles: Tile[] }[] };
type App = { id: string; name: string; label: string; icon: string | null; kind: string; package: string | null; default_section: string | null; bottom_nav: string[]; top_bar: Record<string, unknown> | null; sections: (Page & { background?: string })[] };

export const SA = nav.superapp as unknown as { default_section: string; bottom_nav: string[]; sections: Section[]; top_orbs?: { right?: string }; dynamic_island_action?: string; external_apps: { id: string; install_package?: string; hub_package?: string }[]; [k: string]: unknown };
export const APPS = nav.apps as unknown as App[];
export const ROUTES = routesJson.routes as { path: string; kind: string; section?: string; app?: string; page?: string[] }[];
const TARGETS = targetsJson.targets as Record<string, string>;
const PACKAGES: Record<string, string> = Object.fromEntries(APPS.filter((a) => a.package).map((a) => [a.package as string, a.id]));
const sectionById = new Map(SA.sections.map((s) => [s.id, s]));

export function href(base: string, target: string | undefined | null): { href: string | null; external: boolean } {
  const r = resolveTarget(target, TARGETS, PACKAGES);
  if (r.kind === 'path') return { href: joinBase(base, r.path), external: false };
  if (r.kind === 'url') return { href: r.url, external: true };
  return { href: null, external: false };
}

/** TileStrip input: a separator rides on the previous tile (separatorAfter). */
export function tileItems(base: string, tiles: Tile[]): TileItem[] {
  const out: TileItem[] = [];
  for (const t of tiles ?? []) {
    if (t.separator || t.label === '|') { if (out.length) out[out.length - 1].separatorAfter = true; continue; }
    const h = href(base, t.target ?? t.id);
    out.push({ id: t.id ?? t.label, label: t.label, icon: t.icon ?? null, href: h.href, external: h.external });
  }
  return out;
}

export function cloudGroups(base: string): TileGroup[] {
  const cloud = sectionById.get('cloud');
  return (cloud?.tile_groups ?? []).map((g) => ({ title: g.title, tiles: tileItems(base, g.tiles) }));
}

export function shellData(base: string): ShellData {
  const seed = shellSeed as unknown as { app: { name: string; build: string; user: ShellData['app']['user'] }; statusBar: { left: { label: string; active: boolean }[]; right: { label: string; value: string }[] } };
  const left = seed.statusBar.left;
  const on = (l: string) => left.find((c) => c.label === l)?.active ?? false;
  return {
    bottom: SA.bottom_nav.map((id) => {
      const s = sectionById.get(id);
      return { id, label: s?.label ?? id, icon: (s?.icon as string) ?? 'ic_home', href: joinBase(base, id === 'home' ? '' : `${id}/`) };
    }),
    drawer: drawerRows(SA as never).map((r) => ({ ...r, href: r.target ? href(base, r.target).href : null })),
    homeHref: joinBase(base, ''),
    orbHref: href(base, SA.top_orbs?.right).href,
    islandHref: href(base, SA.dynamic_island_action).href,
    // NetworkSections.ORDER: mobile, WiFi, BT, WG, KDE, ADB, Data, HS, GPS (on = white, off = #44FFFFFF); the replica's mock state.
    chips: [
      { label: '5G', on: on('5G'), dots: 4 }, { label: 'WiFi', on: on('WiFi'), dots: 3 }, { label: 'BT', on: on('BT'), dots: 1 },
      { label: 'WG', on: on('WG'), dots: 0 }, { label: 'KDE', on: on('KDE'), dots: 0 }, { label: 'ADB', on: false, dots: -1 },
      { label: 'Data', on: on('USB'), dots: -1 }, { label: 'HS', on: false, dots: -1 }, { label: 'GPS', on: false, dots: 0 },
    ],
    right: seed.statusBar.right.filter((r) => r.label !== 'BAT').map((r) => `${r.label} ${r.value}`),
    battery: parseInt(seed.statusBar.right.find((r) => r.label === 'BAT')?.value ?? '84', 10),
    app: { name: seed.app.name, build: seed.app.build, stamp: 'web mimic · #1320', user: seed.app.user },
  };
}

/** NavDecl: a page's label defaults to its id (o.text("label", id)). */
const labelOf = (p: { id: string; label?: string }) => p.label ?? p.id;
const visible = (pages: Page[] | undefined) => (pages ?? []).filter((p) => !p.hidden);

function tabsOf(base: string, prefix: string, pages: Page[]): Tab[] {
  return visible(pages).map((p) => ({
    id: p.id,
    label: labelOf(p),
    href: p.action ? href(base, p.action).href : joinBase(base, `${prefix}${p.id}/`),
    action: !!(p.action || p.is_action),
    separatorBefore: !!p.separator_before,
  }));
}

export type StackCardData = { title: string; subtitle: string; rows: [string, string][]; caption: string; href: string | null };
export type ItemRow = { title: string; subtitle: string; meta: string; href: string | null; lead: string };
export type Body = {
  cube?: boolean;
  groups?: TileGroup[];
  quickmarks?: boolean;
  tiles?: TileItem[];
  wrap?: boolean;
  stack?: StackCardData[];
  items?: ItemRow[];
  viewType?: string;
  note?: string;
  empty?: { title: string | null; caption: string };
};

type ContentPage = { id: string; label?: string; view?: { type?: string; note?: string; emptyTitle?: string; emptyBody?: string }; items?: { title: string; subtitle?: string; meta?: string; target?: string }[]; tiles?: Tile[]; stack?: Record<string, unknown>[] };
function contentPage(sectionId: string, pageId: string): ContentPage | undefined {
  const sec = (content as { sections: Record<string, { pages: ContentPage[] }> }).sections[sectionId];
  const corePage = (core as unknown as { sections: Record<string, { pages: ContentPage[] }> }).sections[sectionId];
  return sec?.pages.find((p) => p.id === pageId) ?? corePage?.pages.find((p) => p.id === pageId);
}

function stackCards(base: string, declared: { kind?: string; title: string; subtitle?: string }[] | undefined, seed: Record<string, unknown>[] | undefined): StackCardData[] {
  const out: StackCardData[] = [];
  for (const c of declared ?? []) {
    const s = (seed ?? []).find((x) => x.title === c.title || (c.kind && x.kind === c.kind));
    out.push({ title: c.title, subtitle: c.subtitle ?? (s?.subtitle as string) ?? '', rows: ((s?.rows as unknown[]) ?? []).filter((r): r is [string, string] => Array.isArray(r) && typeof r[0] === 'string').map((r) => [r[0], String(r[1] ?? '')]),
      caption: (s?.caption as string) ?? 'Live on the device: this card reads phone or fleet state a browser cannot reach.', href: href(base, s?.target as string).href });
  }
  return out;
}

export function pageBody(base: string, section: Section, page: Page | null): Body {
  if (!page) return { empty: { title: section.label, caption: 'Open this section on the phone.' } };
  if (section.id === 'cloud' && page.id === 'apps') return { groups: cloudGroups(base), quickmarks: true };
  if (section.id === 'cloud' && page.id === 'lnktree') {
    const groups = (linktree as { groups: { label?: string; title?: string; tiles: { label: string; icon?: string; href?: string }[] }[] }).groups.map((g) => ({
      title: g.title ?? g.label ?? '', tiles: g.tiles.map((t) => ({ id: t.label, label: t.label, icon: t.icon ?? null, href: t.href ?? null, external: !!t.href })),
    }));
    return { groups };
  }
  if (page.mirror_section) {
    const m = sectionById.get(page.mirror_section);
    return { tiles: visible(m?.pages).map((p) => ({ id: p.id, label: p.label, icon: p.icon ?? null, href: p.action ? href(base, p.action).href : joinBase(base, `${m!.id}/${p.id}/`) })), wrap: true };
  }
  const tiles = section[`tiles_${page.id}`] as Tile[] | undefined;
  const stack = section[`stack_${page.id}`] as { kind?: string; title: string; subtitle?: string }[] | undefined;
  const c = contentPage(section.id, page.id);
  const body: Body = {};
  if (tiles?.length || c?.tiles?.length) body.tiles = tileItems(base, (tiles?.length ? tiles : c?.tiles) ?? []);
  if (body.tiles && section.id === 'phone') body.wrap = true;
  if (stack?.length || c?.stack?.length) body.stack = stackCards(base, stack?.length ? stack : (c?.stack as never), c?.stack);
  if (c?.items?.length) {
    body.items = c.items.map((it) => ({ title: it.title, subtitle: it.subtitle ?? '', meta: it.meta ?? '', href: href(base, it.target).href, lead: it.title.replace(/^[#@]/, '').slice(0, 1).toUpperCase() }));
    body.viewType = c.view?.type ?? 'list';
    body.note = c.view?.note;
  }
  if (!body.tiles && !body.stack && !body.items) body.empty = { title: c?.view?.emptyTitle ?? null, caption: c?.view?.emptyBody ?? 'Live on the device: this page reads phone or fleet state a browser cannot reach.' };
  return body;
}

export type SuperAppView = {
  kind: 'superapp'; section: string; sectionLabel: string; atHome: boolean; backHref: string | null;
  tabs: Tab[]; tabSelected: string | null; subtabs: Tab[]; subSelected: string | null; tabHrefs: string[];
  title: string; body: Body; detail: Body | null; path: string;
};
export type FleetTab = { id: string; label: string; icon: string; href: string | null };
export type AppView = {
  kind: 'app'; app: { id: string; name: string; label: string; icon: string | null; kind: string };
  sections: { id: string; label: string; icon: string; href: string }[]; section: string | null; sectionLabel: string;
  page: string | null; sub: string | null;
  tabs: FleetTab[]; tabSelected: string | null; subtabs: FleetTab[]; subSelected: string | null; title: string; path: string; portal: boolean;
  listDetail: boolean; background: string;
  crumbs: { label: string; href: string | null }[]; related: { id: string; label: string; href: string | null; indent: number; selected: boolean }[];
  aiHref: string | null; profileHref: string | null; configsHref: string | null;
  portalInfo: { url: string; service: string; embeddable: boolean; serviceHref: string } | null;
  data?: unknown;
};

function back(base: string, parts: string[], section: Section): string | null {
  if (parts.length <= 1) return joinBase(base, '');
  const first = visible(section.pages)[0]?.id;
  if (parts.length > 2) return joinBase(base, `${parts[0]}/${parts[1]}/`);
  return parts[1] === first ? joinBase(base, '') : joinBase(base, `${parts[0]}/${first}/`);
}

export function superappView(base: string, path: string): SuperAppView | null {
  const parts = path.split('/').filter(Boolean);
  if (!parts.length) {
    return { kind: 'superapp', section: 'home', sectionLabel: 'Home', atHome: true, backHref: null, tabs: [], tabSelected: null, subtabs: [], subSelected: null, tabHrefs: [],
      title: 'Cloud SuperApp', body: { cube: true, groups: cloudGroups(base) }, detail: null, path: '' };
  }
  const section = sectionById.get(parts[0]);
  if (!section) return null;
  const pages = section.pages ?? [];
  const page = parts[1] ? pages.find((p) => p.id === parts[1]) ?? null : visible(pages)[0] ?? null;
  if (parts[1] && !page) return null;
  const sub = page?.pages?.length ? (parts[2] ? page.pages.find((p) => p.id === parts[2]) ?? null : visible(page.pages)[0] ?? null) : null;
  if (parts[2] && !sub) return null;
  const tabs = tabsOf(base, `${section.id}/`, pages);
  return {
    kind: 'superapp', section: section.id, sectionLabel: section.label, atHome: false, backHref: back(base, parts, section),
    tabs, tabSelected: page?.id ?? null,
    subtabs: page?.pages?.length ? tabsOf(base, `${section.id}/${page.id}/`, page.pages) : [], subSelected: sub?.id ?? null,
    tabHrefs: tabs.map((t) => t.href ?? ''),
    title: [page?.label, section.label].filter(Boolean).join(' · '),
    body: pageBody(base, section, sub ?? page), detail: null, path,
  };
}

const lists = overlay.list_detail as Record<string, string[]>;
const portals = overlay.portals as Record<string, { url: string; service: string; embeddable: boolean }>;
type APage = Page & { background?: string };
function fleetTabs(base: string, prefix: string, pages: APage[]): FleetTab[] {
  return (pages ?? []).filter((p) => !p.hidden).map((p) => ({ id: p.id, label: labelOf(p), icon: p.icon ?? 'tab', href: p.action ? href(base, p.action).href : joinBase(base, `${prefix}${p.id}/`) }));
}
/** id -> site path of every page of [section] (depth-first), for the title dropdown's entries. */
function pagePaths(prefix: string, pages: APage[] | undefined, out = new Map<string, string>()) {
  for (const p of pages ?? []) { out.set(p.id, `${prefix}${p.id}/`); pagePaths(`${prefix}${p.id}/`, p.pages, out); }
  return out;
}
export function appView(base: string, path: string): AppView | null {
  const parts = path.split('/').filter(Boolean);
  const app = APPS.find((a) => a.id === parts[0]);
  if (!app) return null;
  const portal = parts[1] === 'portal';
  const secId = portal ? null : parts[1] ?? app.default_section;
  const section = (secId ? app.sections.find((s) => s.id === secId) ?? null : null) as (APage | null);
  if (parts[1] && !portal && !section) return null;
  const page = section?.pages?.length ? (parts[2] ? section.pages.find((p) => p.id === parts[2]) ?? null : visible(section.pages)[0] ?? null) : null;
  if (parts[2] && !page) return null;
  const sub = page?.pages?.length ? (parts[3] ? page.pages.find((p) => p.id === parts[3]) ?? null : visible(page.pages)[0] ?? null) : null;
  if (parts[3] && !sub) return null;
  const order = app.bottom_nav.length ? app.bottom_nav : app.sections.map((s) => s.id);
  const secs = order.map((id) => app.sections.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s);
  // the first row: NavBarTopFirstRow's breadcrumb + dropdown, from the same declaration (titleHierarchy / titleNav)
  // the first crumb is the installed app's label (defaultAppName): build.json display_name
  let crumbs: AppView['crumbs'] = [{ label: app.name, href: joinBase(base, `${app.id}/`) }];
  let related: AppView['related'] = [];
  if (section) {
    const paths = pagePaths(`${app.id}/${section.id}/`, section.pages);
    const entryHref = (e: Entry) => e.action ? href(base, e.action).href : e.depth === 0 ? joinBase(base, `${app.id}/${e.id}/`) : paths.has(e.id) ? joinBase(base, paths.get(e.id)!) : null;
    const tn = titleNav(app.name, labelOf(section), titleHierarchy(section, (sub ?? page)?.id ?? null), secs);
    crumbs = tn.crumbs.map((c, i) => ({ label: c.label, href: i === 0 ? joinBase(base, `${app.id}/`) : c.target ? entryHref(c.target) : null }));
    related = tn.related.map((e) => ({ id: e.id, label: e.label, href: entryHref(e), indent: Math.max(0, e.depth - tn.currentDepth), selected: e.selected }));
  }
  const has = (id: string) => app.sections.some((s) => s.id === id);
  const p = portals[app.id];
  return {
    kind: 'app',
    app: { id: app.id, name: app.name, label: app.label, icon: app.icon, kind: app.kind },
    sections: secs.map((s) => ({ id: s.id, label: labelOf(s), icon: s.icon ?? 'tab', href: joinBase(base, `${app.id}/${s.id}/`) })),
    section: section?.id ?? null, sectionLabel: section ? labelOf(section) : '', page: page?.id ?? null, sub: sub?.id ?? null,
    tabs: section ? fleetTabs(base, `${app.id}/${section.id}/`, section.pages ?? []) : [], tabSelected: page?.id ?? null,
    subtabs: page?.pages?.length ? fleetTabs(base, `${app.id}/${section!.id}/${page.id}/`, page.pages) : [], subSelected: sub?.id ?? null,
    title: [sub && labelOf(sub), page && labelOf(page), section && labelOf(section), app.label].filter(Boolean).join(' · '), path, portal,
    listDetail: !!section && (lists[app.id] ?? []).includes(section.id),
    background: section?.background ?? 'dark',
    crumbs, related,
    aiHref: has('ai') ? joinBase(base, `${app.id}/ai/`) : null,
    profileHref: app.id === 'cloud-account' ? null : joinBase(base, 'cloud-account/'),
    configsHref: has('configs') ? joinBase(base, `${app.id}/configs/`) : has('settings') ? joinBase(base, `${app.id}/settings/`) : null,
    portalInfo: p ? { ...p, serviceHref: joinBase(base, `${p.service}/`) } : null,
  };
}

/** Every prerendered path except home ('') and the explicit routes. */
export const ENTRY_PATHS = ROUTES.map((r) => r.path).filter((p) => p !== '');
