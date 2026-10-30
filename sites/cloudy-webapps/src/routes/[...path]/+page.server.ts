import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { EntryGenerator } from './$types';
import { ENTRY_PATHS, superappView, appView, shellData } from '$lib/server/nav';

// Every SuperApp section/page and every fleet app/section/page from the GENERATED routes.json (B.6): one prerendered URL each.
export const entries: EntryGenerator = () => ENTRY_PATHS.map((p) => ({ path: p.replace(/\/$/, '') }));

export const load = ({ params }) => {
  const path = params.path ? `${params.path}/` : '';
  const view = superappView(base, path) ?? appView(base, path);
  if (!view) error(404, `No page ${path}`);
  return { view, shell: shellData(base) };
};
