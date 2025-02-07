<script lang="ts">
	import Button from '@/lib/components/button.svelte'
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

<a href="/afspraak/overzicht/{data.event.id}" class="my-4 block">Of bekijken.</a>

<ul class="grid gap-2">
	{#each data.event.options as option}
		<li>
			<div class="my-2 font-medium">
				{formatDateTimeRange(option)}
			</div>
			<div class="flex gap-2 rounded">
				<Button>Ja</Button>
				<Button>Nee</Button>
				<Button>Misschien</Button>
			</div>
		</li>
	{/each}
</ul>
