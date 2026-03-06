<script lang="ts">
	import Icon from '@/components/icon.svelte'

	let {
		question,
		open = false,
		children
	}: { question: string; open?: boolean; children: import('svelte').Snippet } = $props()
</script>

<details
	class="group mb-3 not-last-of-type:border-b not-last-of-type:pb-3 motion-safe:transition"
	name="faq-item"
	{open}
>
	<summary
		class="flex cursor-pointer list-none justify-between gap-2 rounded py-1 font-semibold text-neutral-800 sm:text-lg sm:font-medium dark:text-neutral-200"
	>
		<span class="not-group-open:truncate" title={question}>{question}</span>
		<Icon
			icon="tabler--chevron-right"
			class="my-0.5 size-5 duration-100 group-open:rotate-90 motion-safe:transition"
		/>
	</summary>
	<p class="pt-2 pb-2 text-neutral-800 dark:text-neutral-200">
		{@render children()}
	</p>
</details>

<style>
	@supports selector(::details-content) and (not (-moz-appearance: none)) {
		@media (prefers-reduced-motion: no-preference) {
			::details-content {
				height: 0;
				transition:
					height 100ms ease,
					content-visibility 100ms ease allow-discrete;
				overflow: clip;
			}

			details[open]::details-content {
				height: auto;
			}
		}
	}
</style>
