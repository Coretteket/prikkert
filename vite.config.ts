import MagicString from 'magic-string'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

export default defineConfig({
	plugins: [tablerIcons(), sveltekit(), tailwindcss()],
})

// The '@tabler/icons-svelte' package exports all icons as named exports through a single barrel file.
// This makes the dev server unbelievably slow, which has been an unresolved issue for over two years.
// This workaround was suggested here: https://github.com/tabler/tabler-icons/issues/669#issuecomment-2257718909.
function tablerIcons() {
	return {
		name: 'tabler-icons',
		transform(code, id) {
			const ms = new MagicString(code, { filename: id })
			ms.replace(
				/([ \t]*)import\s+\{([^;]*?)}\s+from\s+['"]@tabler\/icons-svelte['"];?/g,
				(match, whitespace: string, imports: string) =>
					imports
						.split(',')
						.map((v) => v.trim())
						.map((name) => {
							const newName = name
								.replace(/([A-Z]|[0-9]+)/g, '-$1')
								.toLowerCase()
								.slice(6)
							return `${whitespace}import ${name} from '@tabler/icons-svelte/icons/${newName}'${match.endsWith(';') ? ';' : ''}`
						})
						.join('\n'),
			)

			if (ms.hasChanged()) return { code: ms.toString(), map: ms.generateMap() }
		},
	} satisfies Plugin
}
