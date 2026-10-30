// /cloud-superapp/apps/<id>/<section>/<page> (the old replica) -> the new cloud-<id>/<section>/<page>/, or the nearest
// existing ancestor when Android has since dropped that page. Shared by test-routes.mjs and gen-redirects.mjs (M7).
export function oldAppTarget(oldPath, routeSet) {
  const m = /^apps\/([^/]+)\/?(.*)$/.exec(oldPath.replace(/\/$/, ''));
  if (!m) return null;
  const parts = [`cloud-${m[1]}`, ...m[2].split('/').filter(Boolean)];
  for (let n = parts.length; n > 0; n--) { const p = parts.slice(0, n).join('/') + '/'; if (routeSet.has(p)) return p; }
  return null;
}
