import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import finterm from '@cloudy/ui/nav/finterm.json';
import { appView } from '$lib/server/nav';
import type { EntryGenerator } from './$types';

// One prerendered page per FinTerm dashboard (#1342): the 17 entries of the FI | EQ | EX | NW | PM tabs, inside the app's fleet shell.
export const entries: EntryGenerator = () => finterm.dashboards.map((d) => ({ app: finterm.app_id, tab: d.tab, dash: d.slug }));

export const load = ({ params }) => {
  const dash = finterm.dashboards.find((d) => d.tab === params.tab && d.slug === params.dash);
  const view = appView(base, `${params.app}/${params.tab}/`);
  if (!dash || !view) error(404, `No dashboard ${params.tab}/${params.dash}`);
  view.crumbs = [...view.crumbs, { label: dash.entry, href: null }];
  view.title = `${dash.entry} · ${view.title}`;
  return { view, dashId: dash.id };
};
