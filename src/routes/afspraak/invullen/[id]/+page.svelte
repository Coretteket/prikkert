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

<a href="/afspraak/overzicht/{data.event.id}" class="my-4 block">Of bekijken.</a>

<ul class="grid gap-2">
	{#each data.event.options as date}
		<li>
			<div class="my-2">
				{Instant.from(date.startsAt).toZonedDateTimeISO('UTC').toLocaleString('nl', {
					weekday: 'short',
					day: 'numeric',
					month: 'long',
					year: 'numeric',
				})}
			</div>
			<div class="flex gap-2 *:border rounded *:px-2 *:py-1">
				<button>Ja</button>
				<button>Nee</button>
				<button>Misschien</button>
			</div>
		</li>
	{/each}
</ul>
