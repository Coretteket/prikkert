import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-node'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: { '@/*': './src/lib/*' },
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
	},
	compilerOptions: {
		experimental: { async: true },
	},
}

export default config
