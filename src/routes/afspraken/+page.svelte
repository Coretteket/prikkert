<script lang="ts">
	import { formatDateTimeRange } from '@/shared/time-format'
	import Button from '@/components/button.svelte'

	import { getEvents } from './data.remote'

	const events = $derived(await getEvents())

	const numberResponses = (n: number) =>
		n === 0 ? 'Geen reacties' : n === 1 ? '1 reactie' : `${n} reacties`
</script>

<h1 class="mb-10 text-2xl font-[520] xs:text-3xl xs:font-medium">Afspraken</h1>

<div class="space-y-4">
	{#each events as event (event.id)}
		<a
			href="/afspraak/overzicht/{event.id}"
			class="block overflow-hidden rounded-lg border px-6 py-5 hover:bg-neutral-50 motion-safe:transition-colors dark:hover:bg-neutral-800/50"
		>
			<h2 class="mb-2 text-lg font-semibold text-neutral-700 dark:text-neutral-300">
				{event.title}
			</h2>

			<p class="text-neutral-600 dark:text-neutral-400">
				{formatDateTimeRange(event.firstDate, event.lastDate)}
				<span class="mx-1">·</span>
				{numberResponses(event.numberOfResponses)}
			</p>
		</a>
	{:else}
		<div
			class="rounded-lg border border-neutral-300 px-6 py-9 text-center text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
		>
			<p class="text-lg">Je hebt nog niet gereageerd of een afspraak aangemaakt.</p>
		</div>
	{/each}
</div>

<Button
	variant="primary"
	as="link"
	href="/afspraak/aanmaken"
	size="md"
	class="mt-10 ml-auto"
>
	Afspraak aanmaken
</Button>
