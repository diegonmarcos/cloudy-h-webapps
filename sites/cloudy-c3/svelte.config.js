import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { execFileSync } from 'node:child_process';

// The build version is the git tree hash of this site's src + the shared package, so an unchanged
// source renders a byte-identical dist (dist is committed; CI rebuilds it and diffs).
function treeVersion() {
  try {
    const t = (p) => execFileSync('git', ['rev-parse', `HEAD:${p}`], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().slice(0, 10);
    return `${t('sites/cloudy-c3/src')}-${t('packages/cloudy-ui')}-${t('packages/c3-data')}`;
  } catch {
    return 'dev';
  }
}

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: 'dist', assets: 'dist', fallback: '404.html', precompress: false, strict: true }),
    // /cloudy-c3 is fixed by contract: the owner chose /cloudy-c3/ (#1320); old /cloud/* URLs redirect here at the M7 cut-over.
    paths: { base: '/cloudy-c3', relative: false },
    version: { name: treeVersion() },
    prerender: {
      entries: ['*'],
      handleMissingId: 'fail',
      // links into the other site (/cloud-webapps/...) are published by its own build
      handleHttpError: ({ path, message }) => { if (!path.startsWith('/cloudy-c3/')) return; throw new Error(message); },
    },
  },
};
