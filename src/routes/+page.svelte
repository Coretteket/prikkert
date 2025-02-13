<script lang="ts">
	import Button from '@/lib/components/button.svelte'
</script>

<header class="my-8 space-y-4">
	<h2
		class="font-display mb-8 text-center text-3xl font-semibold sm:text-[2.5rem] sm:leading-tight"
	>
		<p>Samen plannen,</p>
		<p>zo geprikt</p>
	</h2>
	<h3
		class="mx-auto mb-8 max-w-60 text-center text-lg font-[350] text-balance text-zinc-700 sm:max-w-100 dark:text-zinc-400"
	>
		Vind
		<strong class="font-medium text-pink-700 dark:text-pink-500">gratis</strong>
		én
		<strong class="font-medium text-pink-700 dark:text-pink-500">reclamevrij</strong>
		het beste moment voor elke groepsafspraak.
	</h3>
	<Button as="link" href="/afspraak/maken" size="lg" color="primary" class="mx-auto">
		Afspraak maken
	</Button>
</header>
