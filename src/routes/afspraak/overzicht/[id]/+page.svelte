<script lang="ts">
	import { formatDateTimeRange } from '@/lib/time-format'

	let { data } = $props()
</script>

<h2 class="text-lg font-bold">{data.event.title}</h2>
{#if data.event.description}
	<p>Beschrijving: {data.event.description}</p>
{/if}
{#if data.event.location}
	<p>Locatie: {data.event.location}</p>
{/if}

<a href="/afspraak/invullen/{data.event.id}" class="my-4 block">Of invullen.</a>

<ul class="list-inside list-disc">
	{#each data.event.options as option}
		<li>
			{formatDateTimeRange(option)}
		</li>
	{/each}
</ul>
