// The C3 control-centre API client (#1320 B.7), browser side. Addressing rule (c3-infra rules/addressing.md): MESH FIRST
// (c3-pvt, reached only from a browser on the WireGuard mesh, no credential), then the PUBLIC endpoint with the user's own
// bearer, else the committed snapshot. The bearer is typed by the user and lives in sessionStorage only: never in the repo,
// never in the service worker's cache, never sent to the mesh host. Ported registry: the old portal's typescript/c3-api.ts.
export const MESH_BASE = 'https://c3-pvt.diegonmarcos.com/c3-infra-api';
export const PUBLIC_BASE = 'https://api.diegonmarcos.com/c3-infra-api';
export const BEARER_KEY = 'cloudy-c3:bearer';
export const MODE_KEY = 'cloudy-c3:mode';
export const TIMEOUT_MS = 8000;

export const REGISTRY: Record<string, string> = {
  topology: '/cloud-data/topology', 'topology-network': '/cloud-data/topology/network', 'topology-drift': '/cloud-data/topology/drift',
  'health-declared': '/health/declared', 'health-deployed': '/health/deployed', 'health-drift': '/health/drift', 'health-tier1': '/health/tier1',
  'up-all': '/v2/up/all-services', 'container-resources': '/cloud-data/container-resources', services: '/services', 'front-apps': '/cloud-data/front-apps',
  specs: '/services/all/specs', 'profiling-all': '/v2/profiling/all-containers', 'security-scan': '/security/scan', 'security-docker': '/security/docker',
  'security-ssh': '/security/ssh', 'security-tokens': '/security/tokens', 'security-wireguard': '/security/wireguard', 'cloud-summary': '/cloud/summary',
  'oci-costs': '/cloud/oci/costs', 'gcp-costs': '/cloud/gcp/costs', workflows: '/workflows', 'workflows-dagu': '/workflows/dagu', 'db-audit': '/db/audit',
  'db-deploy-history': '/db/deploy/history', 'db-health-history': '/db/health/history', 'db-uptime': '/db/uptime/report', 'caddy-routes': '/cloud-data/caddy-routes',
  'cloudflare-dns': '/cloud-data/cloudflare-dns', 'firewall-rules': '/cloud-data/firewall-rules', 'wireguard-peers': '/cloud-data/wireguard-peers',
  'dns-services': '/cloud-data/dns-services', 'backup-targets': '/cloud-data/backup-targets', 'home-manager': '/cloud-data/home-manager',
  'metrics-top': '/metrics/top?by=cpu&limit=20', 'metrics-series': '/metrics/series/oci-apps?metric=cpu', 'alerts-active': '/alerts/active',
  'alerts-rules': '/alerts/rules', 'alerts-history': '/alerts/history', events: '/events', slo: '/slo',
};

export type Source = 'mesh' | 'public' | 'snapshot';
export type Result<T> = { data: T; source: Source; errors: string[] };
type Store = { getItem(k: string): string | null };
type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

async function get(fetcher: Fetch, url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), TIMEOUT_MS);
  try {
    const r = await fetcher(url, { headers, signal: c.signal, cache: 'no-store', credentials: 'omit' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(t); }
}

/** [key] from the mesh, else the public endpoint with the session bearer, else [snapshot]. Snapshot mode skips the network. */
export async function c3<T>(key: string, snapshot: T, opts: { fetcher?: Fetch; store?: Store; live?: boolean } = {}): Promise<Result<T>> {
  const fetcher = opts.fetcher ?? fetch;
  const store = opts.store ?? (typeof sessionStorage !== 'undefined' ? sessionStorage : { getItem: () => null });
  const live = opts.live ?? store.getItem(MODE_KEY) === 'live';
  const path = REGISTRY[key];
  const errors: string[] = [];
  if (!live || !path) return { data: snapshot, source: 'snapshot', errors: path ? [] : [`unknown key ${key}`] };
  try { return { data: (await get(fetcher, MESH_BASE + path)) as T, source: 'mesh', errors }; }
  catch (e) { errors.push(`mesh: ${(e as Error).message}`); }
  const bearer = store.getItem(BEARER_KEY);
  if (bearer) {
    try { return { data: (await get(fetcher, PUBLIC_BASE + path, { Authorization: `Bearer ${bearer}` })) as T, source: 'public', errors }; }
    catch (e) { errors.push(`public: ${(e as Error).message}`); }
  } else errors.push('public: no bearer in this session');
  return { data: snapshot, source: 'snapshot', errors };
}
