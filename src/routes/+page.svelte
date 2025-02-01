<script lang="ts">
	import { Instant } from '@/lib/temporal.js'

	let { data } = $props()
</script>

Welkom!

<p>
	{#if data.session}
		Ingelogd als {data.session.user.name ?? 'Anoniem'} tot {Instant.from(data.session.expiresAt)
			.toZonedDateTimeISO('UTC')
			.toLocaleString('nl', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
			})}.
	{:else}
		Niet ingelogd.
	{/if}
</p>

<a href="/afspraak/maken" class="my-4 block w-fit border rounded px-2 py-1">Afspraak maken</a>
