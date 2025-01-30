<script lang="ts">
	import { Instant } from '@/lib/temporal'

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
	{#each data.event.options as date}
		<li>
			{Instant.from(date.startsAt).toZonedDateTimeISO('UTC').toLocaleString('nl', {
				weekday: 'short',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			})}
		</li>
	{/each}
</ul>
