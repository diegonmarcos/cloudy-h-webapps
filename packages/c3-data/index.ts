// Build-time access to the C3 snapshot (packages/c3-data/data/*.json). Server code only: a page gets the slice it renders.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), 'data');
const cache = new Map<string, unknown>();
export function dataset<T = unknown>(name: string): T {
  if (!cache.has(name)) cache.set(name, JSON.parse(readFileSync(join(DIR, `${name}.json`), 'utf8')));
  return cache.get(name) as T;
}
export const DATASETS = readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
