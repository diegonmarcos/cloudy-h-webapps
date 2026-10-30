/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// cloudy-c3 PWA (#1320 B.5/B.7): the shell and the visited prerendered pages offline. NEVER an API response: the c3-infra-api
// is another origin and this worker answers same-origin GETs of this site's own files only; nothing with Authorization.
import { build, files, prerendered, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `cloudy-c3-${version}`;
const SHELL = [...build, ...files];
const OWN = new Set(SHELL);
const PAGES = new Set(prerendered);
sw.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => sw.skipWaiting())); });
sw.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('cloudy-c3-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => sw.clients.claim()));
});
sw.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('authorization')) return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (OWN.has(url.pathname)) { e.respondWith(caches.match(req).then((r) => r ?? fetch(req))); return; }
  const page = url.pathname.replace(/__data\.json$/, '');
  if (!PAGES.has(page) && !PAGES.has(url.pathname)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try { const res = await fetch(req); if (res.ok) cache.put(req, res.clone()); return res; }
    catch (err) { const hit = await cache.match(req); if (hit) return hit; throw err; }
  })());
});
