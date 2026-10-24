import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { sveltekit } from '@sveltejs/kit/vite'
import adapter from '@sveltejs/adapter-node'
import tailwindcss from '@tailwindcss/vite'
import { wuchale } from 'wuchale/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		wuchale(),
		sveltekit({
			preprocess: vitePreprocess(),
			compilerOptions: { experimental: { async: true } },
			adapter: adapter(),
			experimental: { remoteFunctions: true },
			csp: {
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					'base-uri': ['self'],
					'frame-ancestors': ['none'],
					'form-action': ['self'],
					'img-src': ['self', 'data:'],
					'script-src': ['self'],
					'style-src-attr': ['self', 'unsafe-inline'],
				},
			},
		}),
		tailwindcss(),
	],
	build: { assetsInlineLimit: 0 },
})
