<script lang="ts">
	import { formatDateTimeRange } from '@/lib/time-format'

	let { data } = $props()
</script>

<div
	class="rounded-lg border border-pink-900 bg-pink-700 py-12 text-center text-white"
	style={`background-image: url("${data.pattern}")`}
>
	<h1 class="font-display my-2 text-2xl font-bold capitalize drop-shadow-sm">{data.event.title}</h1>
	{#if data.event.owner.name}
		<h2 class="font-semibold text-gray-100 drop-shadow-sm">
			Georganiseerd door {data.event.owner.name}
		</h2>
	{/if}
</div>

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
