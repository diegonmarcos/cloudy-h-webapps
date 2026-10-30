import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  // @cloudy/ui is a workspace package consumed as source.
  server: { fs: { allow: ['../..'] } },
});
