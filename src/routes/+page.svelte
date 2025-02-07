<script lang="ts">
	import Button from '@/lib/components/button.svelte'
	import { Instant } from '@/lib/temporal.js'

	let { data } = $props()
</script>

<header class="my-8 space-y-4">
	<h2 class="font-display mb-8 text-center text-3xl sm:text-4xl leading-tight font-semibold">
		<p>Samen plannen,</p>
		<p>zo geprikt</p>
	</h2>
	<h3 class="mx-auto mb-8 max-w-60 sm:max-w-100 text-center text-lg text-balance text-gray-700">
		Vind
		<strong class="text-pink-700 font-semibold">gratis</strong>
		én
		<strong class="text-pink-700 font-semibold">reclamevrij</strong>
		het beste moment voor elke groepsafspraak.
	</h3>
	<Button as="link" href="/afspraak/maken" size="lg" color="primary" class="mx-auto">
		Afspraak maken
	</Button>
</header>

<p class="mt-20 text-gray-600">
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
