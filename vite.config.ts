import { sveltekit } from '@sveltejs/kit/vite'
import { wuchale } from '@wuchale/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [wuchale(), sveltekit(), tailwindcss()],
})
