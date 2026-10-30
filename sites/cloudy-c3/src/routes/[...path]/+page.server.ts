import { error } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';
import { ENTRIES, c3Page } from '$lib/server/c3';

export const entries: EntryGenerator = () => [{ path: '' }, ...ENTRIES.map((p) => ({ path: p.replace(/\/$/, '') }))];
export const load = ({ params }) => {
  const path = params.path ? `${params.path}/` : '';
  const page = c3Page(path || 'home/');
  if (!page) error(404, `No page ${path}`);
  return page;
};
