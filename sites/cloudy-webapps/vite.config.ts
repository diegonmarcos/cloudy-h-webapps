import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// One 'kit' chunk (+ one CSS file) for the @cloudy/ui components the section and fleet pages share. The home page needs none of
// them (its shell is SuperAppShell + EmptyState), so they stay out of its up-front JS; without the group they split into a
// dozen tiny CSS files that gzip worse than one.
const KIT = /\/packages\/cloudy-ui\/src\/(components\/(?!EmptyState\.)[A-Z]\w*\.svelte|fleet\/Fleet(Shell|FirstRow|SecondRows?|BottomBar|SideMenu)\.svelte)/;

export default defineConfig({
  plugins: [sveltekit()],
  // @cloudy/ui is a workspace package consumed as source.
  server: { fs: { allow: ['../..'] } },
  build: { rollupOptions: { output: { manualChunks: (id) => (KIT.test(id) ? 'kit' : undefined) } } },
});
