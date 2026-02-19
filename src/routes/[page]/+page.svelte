<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import { page } from '$app/state'

	import { renderMarkdown } from './data.remote'

	let data = $derived(await renderMarkdown(page.params.page!))
</script>

<article
	class="mx-auto max-w-130 space-y-4 text-neutral-800 dark:text-neutral-200 [&_a]:font-medium [&_a]:underline [&>h2]:mt-8 [&>h2]:text-lg [&>h2]:font-medium [&>h2]:text-neutral-950 [&>h2]:dark:text-neutral-50"
>
	<h1 class="mb-6 text-2xl font-[520] xs:text-3xl xs:font-medium">
		{data.title}
	</h1>
	<p class="mb-10 text-[17px] text-neutral-700 xs:text-lg dark:text-neutral-300">
		{data.description}
	</p>

	{@html data.body}

	{#if 'lastModified' in data}
		<p class="mt-8 text-neutral-500 dark:text-neutral-400">
			Deze pagina is voor het laatst gewijzigd op
			<a
				href="https://codeberg.org/qcoret/prikkert/commit/{data.lastModifiedCommit}"
				target="_blank"
				class="underline"
			>
				{data.lastModified}
			</a>.
		</p>
	{/if}
</article>
