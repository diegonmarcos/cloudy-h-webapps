// Build-time access to the C3 snapshot (packages/c3-data/data/*.json), bundled by Vite (import.meta.glob), so it works in
// the prerender's server bundle. Server code only: a page gets the slice it renders, never the files.
const FILES = import.meta.glob('./data/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;
export function dataset<T = unknown>(name: string): T {
  const v = FILES[`./data/${name}.json`];
  if (v === undefined) throw new Error(`no C3 dataset ${name}`);
  return v as T;
}
export const DATASETS = Object.keys(FILES).map((f) => f.slice(7, -5)).sort();
