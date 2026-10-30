/** Join a SvelteKit base path and a route path, always with one slash between and a trailing slash
 *  (both sites use trailingSlash 'always', as the old static sites did). */
export function joinBase(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '').replace(/\/+$/, '');
  return p ? `${b}/${p}/` : `${b}/`;
}
