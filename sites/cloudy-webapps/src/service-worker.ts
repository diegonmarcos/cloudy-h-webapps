/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// cloudy-webapps PWA (#1320 B.5): precache the shell (build chunks + static files), cache every page this browser opened
// (stale-while-revalidate), so a visited page reloads offline. Only this site's own files: the service fallback pages under
// /cloud-webapps/<service>/ are not SvelteKit's and are never intercepted; nothing with an Authorization header is cached.
import { build, files, prerendered, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `cloudy-webapps-${version}`;
const SHELL = [...build, ...files];
const OWN = new Set(SHELL);
const PAGES = new Set(prerendered);

sw.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => sw.skipWaiting())); });
sw.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('cloudy-webapps-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => sw.clients.claim()));
});
sw.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('authorization')) return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const scope = new URL(sw.registration.scope).pathname;
  if (!url.pathname.startsWith(scope)) return;
  if (OWN.has(url.pathname)) { e.respondWith(caches.match(req).then((r) => r ?? fetch(req))); return; }
  // prerendered pages and their __data.json: network first, the cached copy offline. Anything else (a service fallback page,
  // an unknown path) is left to the network untouched.
  const page = url.pathname.replace(/__data\.json$/, '');
  if (!PAGES.has(page) && !PAGES.has(url.pathname)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res.ok && res.headers.get('content-type')?.match(/text\/html|application\/json/)) cache.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(req);
      if (hit) return hit;
      throw err;
    }
  })());
});
