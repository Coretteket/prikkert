import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { wuchale } from 'wuchale/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [wuchale(), sveltekit(), tailwindcss()],
	build: { assetsInlineLimit: 0 },
})
