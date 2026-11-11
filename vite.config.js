import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// base: './' makes the built site work from any GitHub Pages subpath
export default defineConfig({
  plugins: [svelte()],
  base: './',
})
