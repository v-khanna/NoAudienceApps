import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit()
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/substack': {
        target: 'https://virkhanna.substack.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/substack/, ''),
      },
      '/api/openlibrary': {
        target: 'https://openlibrary.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openlibrary/, ''),
      },
    },
  }
});
