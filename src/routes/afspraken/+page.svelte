<script lang="ts">
	import { enhance } from '$app/forms'
	import { Instant } from '@/lib/temporal'

	let { data } = $props()
</script>

<div class="space-y-4">
	<p>Je bent ingelogd!</p>
	<form action="/uitloggen" method="post" use:enhance>
		<button type="submit" class="cursor-pointer">Uitloggen</button>
	</form>
	<ul class="list-inside list-disc space-y-2">
		{#each data.events ?? [] as event}
			<li>
				<a href="/afspraak/overzicht/{event.id}" class="text-lg font-bold">
					{event.title}
				</a>
				<ul class="ml-4 list-inside list-disc">
					{#each event.options as date}
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
			</li>
		{/each}
	</ul>
</div>
