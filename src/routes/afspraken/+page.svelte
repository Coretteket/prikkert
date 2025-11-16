<script lang="ts">
	import { PlainDate } from '@/temporal'
	import { formatDateTimeRange } from '@/time-format'
	import { capitalizeFirst } from '@/utils'
	import { resolve } from '$app/paths'

	let { data } = $props()

	const events = $derived(
		(data.events ?? []).toSorted((a, b) => PlainDate.compare(b.createdAt, a.createdAt)),
	)

	const numberResponses = (n: number) =>
		n === 0 ? 'Geen reacties' : n === 1 ? '1 reactie' : `${n} reacties`
</script>

<div class="space-y-4">
	<h1 class="font-display mb-8 text-2xl font-[550]">Afspraken</h1>

	{#each events as event (event.id)}
		<a
			href={resolve('/afspraak/invullen/[eventId]', { eventId: event.id })}
			class="block overflow-hidden rounded-lg border px-6 py-5 hover:bg-neutral-50 motion-safe:transition-colors dark:hover:bg-neutral-800/50"
		>
			<h2 class="mb-2 text-lg font-medium text-neutral-700 dark:text-neutral-300">
				{capitalizeFirst(event.title)}
			</h2>

			<p class="text-neutral-600 dark:text-neutral-400">
				{formatDateTimeRange(event.firstDate, event.lastDate)}
				<span class="mx-1">·</span>
				{numberResponses(event.numberOfResponses)}
			</p>
		</a>
	{/each}
</div>
