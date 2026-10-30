import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { execFileSync } from 'node:child_process';

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
    prerender: { entries: ['*'], handleHttpError: 'fail', handleMissingId: 'fail' },
    alias: { $apps: 'src/apps' },
  },
};
