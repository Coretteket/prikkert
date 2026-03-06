<script lang="ts">
	import Icon from '@/components/icon.svelte'

	let {
		icon,
		left,
		right,
	}: { icon: string; left: import('svelte').Snippet; right: import('svelte').Snippet } = $props()
</script>

<div class="relative grid rounded-lg border max-sm:divide-y sm:grid-cols-2 sm:divide-x">
	<div
		class="absolute top-1/2 left-1/2 z-10 flex aspect-square w-fit -translate-1/2 rounded-lg border-none bg-[color-mix(in_oklab,var(--color-pink-500)_35%,var(--color-neutral-100))] p-3 text-pink-600 max-sm:hidden dark:bg-[color-mix(in_oklab,var(--color-pink-500)_40%,var(--color-neutral-850))] dark:text-pink-100"
	>
		<Icon {icon} class="size-6" />
	</div>

	<div
		class="flex items-center gap-6 from-neutral-900 to-pink-700/5 px-6 py-6.5 sm:px-10 sm:pr-14 dark:bg-linear-to-tl"
	>
		<div
			class="flex aspect-square w-fit rounded-lg border-none bg-[color-mix(in_oklab,var(--color-pink-500)_35%,var(--color-neutral-100))] p-3 text-pink-600 sm:hidden dark:bg-[color-mix(in_oklab,var(--color-pink-500)_40%,var(--color-neutral-850))] dark:text-pink-100"
		>
			<Icon {icon} class="size-6" />
		</div>

		<p class="w-full text-balance text-neutral-800 sm:text-center dark:text-pink-50/90">
			{@render left()}
		</p>
	</div>

	<div class="flex items-center px-6 sm:px-10 py-6.5 sm:pl-14 dark:bg-linear-to-tl">
		<p
			class="w-full text-right text-balance text-neutral-700 sm:text-center dark:text-neutral-50/75"
		>
			{@render right()}
		</p>
	</div>
</div>
