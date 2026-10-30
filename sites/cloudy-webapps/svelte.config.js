import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// The service fallback pages (services/<slug>/) share /cloud-webapps/ but are not this site's: Pages serves them next to it.
const SERVICES = new Set(JSON.parse(readFileSync(new URL('../../scripts/fallback-services.json', import.meta.url), 'utf8')).services.map((s) => s.slug));

// The build version is the git tree hash of this site's src + the shared package, so an unchanged
// source renders a byte-identical dist (dist is committed; CI rebuilds it and diffs).
function treeVersion() {
  try {
    const t = (p) => execFileSync('git', ['rev-parse', `HEAD:${p}`], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().slice(0, 10);
    return `${t('sites/cloudy-webapps/src')}-${t('packages/cloudy-ui')}`;
  } catch {
    return 'dev';
  }
}

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: 'dist', assets: 'dist', fallback: '404.html', precompress: false, strict: true }),
    // /cloud-webapps is fixed by contract: the APK pins https://diegonmarcos.github.io/cloud-webapps with ?embed=1 and the UA CloudSuperApp-Embed/1 (aa_cloud-superapp build.json ui.sections[cloud].pages[webapps].webapps_base).
    paths: { base: '/cloud-webapps', relative: false },
    version: { name: treeVersion() },
    prerender: {
      entries: ['*'],
      handleMissingId: 'fail',
      handleHttpError: ({ path, message }) => {
        if (!path.startsWith('/cloud-webapps/')) return; // another Pages site (/cloud-web/apps/<slug>/ Wasm pages)
        const slug = path.replace(/^\/cloud-webapps\//, '').split('/')[0];
        if (SERVICES.has(slug)) return; // a link to a service page: published by the Pages ship step, not by this build
        throw new Error(message);
      },
    },
    alias: { $apps: 'src/apps' },
  },
};
