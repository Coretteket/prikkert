<script lang="ts">
	import Button from '@/lib/components/button.svelte'
</script>

<header class="my-8 space-y-4">
	<h2 class="font-display mb-8 text-center text-3xl leading-tight font-semibold sm:text-4xl">
		<p>Samen plannen,</p>
		<p>zo geprikt</p>
	</h2>
	<h3 class="mx-auto mb-8 max-w-60 font-[350] text-center text-lg text-balance text-gray-700 sm:max-w-100">
		Vind
		<strong class="font-medium text-pink-700">gratis</strong>
		én
		<strong class="font-medium text-pink-700">reclamevrij</strong>
		het beste moment voor elke groepsafspraak.
	</h3>
	<Button as="link" href="/afspraak/maken" size="lg" color="primary" class="mx-auto">
		Afspraak maken
	</Button>
</header>
