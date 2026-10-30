// The GENERATED web FinTerm declarations (nav/finterm.json, scripts/gen-finterm.mjs from the Android app), typed for the engine and the pages.
import finterm from '../../nav/finterm.json';
import type { Catalog, Dashboard, Source } from './engine';

export const FINTERM = finterm as unknown as Catalog & { app_id: string; tabs: string[]; stacks: Record<string, { kind: string; title: string; subtitle?: string; dashboard?: string }[]> };
export const dashboardOf = (tab: string, slug: string): Dashboard | undefined => FINTERM.dashboards.find((d) => d.tab === tab && d.slug === slug);
export const sourceOf = (id: string): Source | undefined => FINTERM.sources.find((s) => s.id === id);
/** The dashboard page path (relative to the site base) of an entry. */
export const dashPath = (appId: string, d: Pick<Dashboard, 'tab' | 'slug'>) => `${appId}/${d.tab}/${d.slug}/`;
