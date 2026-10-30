// The SuperApp target grammar (ShellActivity.kt onTileClicked): section:<id> · page:<s>/<p> · extapp:<app>[#page:<s>/<p>] ·
// app://<pkg> · intent: · http(s) URI · action:<id> · stub:. The web has no app-link scheme either, so a target maps to a
// site-relative path (no leading slash, trailing slash, '' = home), an external URL, or nothing (a device-only action).
export type Href = { kind: 'path'; path: string } | { kind: 'url'; url: string } | { kind: 'none'; why: string };

export function resolveTarget(target: string | undefined | null, targets: Record<string, string>, packages: Record<string, string> = {}): Href {
  const t = (target ?? '').trim();
  if (!t) return { kind: 'none', why: 'no target' };
  if (/^https?:\/\//.test(t)) return { kind: 'url', url: t };
  if (t in targets) return { kind: 'path', path: targets[t] };
  const ext = /^extapp:([a-z0-9-]+)(?:#page:([^/]+)\/?([^/]*)?)?$/.exec(t);
  if (ext) {
    const [, app, sec, page] = ext;
    const key = sec ? `extapp:${app}#page:${sec}/${page ?? ''}` : `extapp:${app}`;
    if (key in targets) return { kind: 'path', path: targets[key] };
    if (`extapp:${app}` in targets) return { kind: 'path', path: targets[`extapp:${app}`] };
  }
  const page = /^page:([^/]+)\/(.+)$/.exec(t);
  if (page && `section:${page[1]}` in targets) return { kind: 'path', path: targets[`section:${page[1]}`] };
  const app = /^app:\/\/(.+)$/.exec(t);
  if (app && packages[app[1]]) return { kind: 'path', path: `${packages[app[1]]}/` };
  return { kind: 'none', why: t.split(':')[0] };
}

/** /t/<target> decoding: the path after /t/ plus the URL fragment (extapp:<app>#page:... arrives split by the browser). */
export function targetFromLocation(pathname: string, search: string, hash: string, base: string): string {
  if (search.length > 1) return decodeURIComponent(search.slice(1).replace(/^target=/, ''));
  const rest = decodeURIComponent(pathname.slice(pathname.indexOf(`${base}/t/`) + base.length + 3)).replace(/\/$/, '');
  const frag = decodeURIComponent(hash.replace(/^#/, ''));
  return rest ? (frag ? `${rest}#${frag}` : rest) : frag;
}
