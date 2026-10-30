// The old /cloud/ portal's pages, re-homed under /cloudy-c3/portal/<page>/ (#1320 M6): each page is a set of panels, each
// panel one c3-infra-api dataset (registry key) shown as Kit rows. extract() turns any dataset shape into rows; it is pure,
// so the same function draws the prerendered snapshot and, in live mode, the browser's fresh fetch.
export type PanelRow = { title: string; subtitle: string; meta: string };
export type Panel = { key: string; title: string };
export type PortalPage = { id: string; label: string; icon: string; old: string; caption: string; panels: Panel[] };

export const PORTAL: PortalPage[] = [
  { id: 'control-center', label: 'Control Center', icon: 'dashboard', old: 'cloud_control_center.html', caption: 'Topology, health, resources, profiling, security, cost, workflows, audit.',
    panels: [{ key: 'topology', title: 'Topology' }, { key: 'health-tier1', title: 'Health' }, { key: 'container-resources', title: 'Resources' }, { key: 'profiling-all', title: 'Profiling' },
      { key: 'security-scan', title: 'Security' }, { key: 'cloud-summary', title: 'Cost' }, { key: 'workflows', title: 'Workflows' }, { key: 'db-audit', title: 'Audit' }] },
  { id: 'cloud-control', label: 'Cloud Control', icon: 'tune', old: 'cloud_control.html', caption: 'Topology, health, security, ops, apps, VMs, services.',
    panels: [{ key: 'topology-network', title: 'Topology' }, { key: 'health-deployed', title: 'Health' }, { key: 'security-docker', title: 'Security' },
      { key: 'up-all', title: 'Ops' }, { key: 'front-apps', title: 'Apps' }, { key: 'services', title: 'Services' }] },
  { id: 'architecture', label: 'Architecture', icon: 'account_tree', old: 'architecture.html', caption: 'Security, infrastructure, data and AI architecture.',
    panels: [{ key: 'firewall-rules', title: 'Security architecture' }, { key: 'wireguard-peers', title: 'Mesh' }, { key: 'caddy-routes', title: 'Infrastructure' }, { key: 'backup-targets', title: 'Data' }] },
  { id: 'products', label: 'Products', icon: 'inventory_2', old: 'products.html', caption: 'Solutions, front, back, infra, VMs and resource allocation.',
    panels: [{ key: 'front-apps', title: 'Front' }, { key: 'services', title: 'Back' }, { key: 'cloud-summary', title: 'Infra / VMs' }, { key: 'container-resources', title: 'Resource allocation' }] },
  { id: 'feed-docs', label: 'Feed docs', icon: 'rss_feed', old: 'feed_docs.html', caption: 'Push notifications (ntfy): channels, subscribing, sending.',
    panels: [{ key: 'events', title: 'Recent events' }, { key: 'alerts-rules', title: 'Alert rules' }] },
  { id: 'gallery', label: 'Gallery', icon: 'apps', old: 'c3_gallery.html', caption: 'The C3 components, drawn with the fleet kit.',
    panels: [{ key: 'health-tier1', title: 'State pills' }, { key: 'slo', title: 'SLOs' }] },
  { id: 'mcp', label: 'MCP', icon: 'hub', old: 'mcp', caption: 'The fleet MCP servers (c3-infra-mcp and friends).', panels: [{ key: 'services', title: 'MCP services' }] },
  { id: 'api', label: 'API', icon: 'api', old: 'api', caption: 'The c3-infra-api: mesh https://c3-pvt.diegonmarcos.com/c3-infra-api, public https://api.diegonmarcos.com/c3-infra-api (bearer).',
    panels: [{ key: 'services', title: 'API services' }] },
];

const str = (v: unknown) => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v).slice(0, 80) : String(v));
const NAME = ['name', 'title', 'id', 'alias', 'domain', 'service', 'vm', 'key'];
const SUB = ['description', 'domain', 'status', 'state', 'type', 'category', 'vm', 'alias', 'shape'];
/** Any dataset -> rows: an array (or the first array property) of objects by their name-ish fields, else key/value. */
export function extract(data: unknown, filter?: (r: PanelRow) => boolean, max = 40): PanelRow[] {
  let list: unknown = data;
  if (list && typeof list === 'object' && !Array.isArray(list)) {
    const arr = Object.values(list as object).find((v) => Array.isArray(v) && v.length && typeof v[0] === 'object');
    if (arr) list = arr;
  }
  let out: PanelRow[];
  if (Array.isArray(list)) {
    out = list.map((o) => {
      if (!o || typeof o !== 'object') return { title: str(o), subtitle: '', meta: '' };
      const r = o as Record<string, unknown>;
      const t = NAME.find((k) => typeof r[k] === 'string' && r[k]);
      const s = SUB.find((k) => k !== t && r[k] != null && typeof r[k] !== 'object');
      const m = ['reachable', 'ok', 'healthy', 'latencyMs', 'count'].find((k) => r[k] != null);
      return { title: t ? str(r[t]) : str(o), subtitle: s ? str(r[s]) : '', meta: m ? `${m} ${str(r[m])}` : '' };
    });
  } else if (list && typeof list === 'object') {
    out = Object.entries(list as object).filter(([k]) => !k.startsWith('_')).map(([k, v]) => ({ title: k, subtitle: str(v), meta: '' }));
  } else out = [];
  return (filter ? out.filter(filter) : out).slice(0, max);
}
export const panelFilter = (page: string, key: string) =>
  page === 'mcp' && key === 'services' ? (r: PanelRow) => /mcp/i.test(r.title) : page === 'api' && key === 'services' ? (r: PanelRow) => /api/i.test(r.title) : undefined;
