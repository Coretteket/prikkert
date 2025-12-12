<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import { page } from '$app/state'

	import { renderMarkdown } from './data.remote'

	let data = $derived(await renderMarkdown(page.params.page!))
</script>

<article
	class="mx-auto max-w-130 space-y-4 text-neutral-700 dark:text-neutral-300 [&_a]:underline [&>h2]:mt-8 [&>h2]:text-lg [&>h2]:font-medium [&>h2]:text-neutral-950 [&>h2]:dark:text-neutral-50"
>
	<h1 class="font-display mb-6 text-2xl font-[550] text-neutral-950 dark:text-neutral-50">
		{data.title}
	</h1>
	<p class="mb-10 text-lg font-[350] text-neutral-700 dark:text-neutral-300">
		{data.description}
	</p>

	{@html data.body}

	{#if 'lastModified' in data}
		<p class="mt-8 font-[350] text-neutral-500 dark:text-neutral-400">
			Deze pagina is voor het laatst gewijzigd op {data.lastModified}.
		</p>
	{/if}
</article>
