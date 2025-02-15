<script lang="ts">
	import { IconAd, IconCode, IconMoneybag, IconShield } from '@tabler/icons-svelte'
</script>

<header class="my-10 space-y-4">
	<h2
		class="font-display mb-8 text-center text-4xl font-semibold text-zinc-900 sm:text-[2.75rem] sm:leading-tight dark:text-zinc-100"
	>
		<p>Samen plannen,</p>
		<p>zo geprikt</p>
	</h2>
	<h3
		class="mx-auto mb-8 max-w-80 text-center text-xl font-[350] text-zinc-700 sm:max-w-100 text-balance dark:text-zinc-300"
	>
		Vind
		<strong class="font-semibold text-pink-700 dark:text-zinc-200">gratis</strong>
		én
		<strong class="font-semibold text-pink-700 dark:text-zinc-200">reclamevrij</strong>
		het beste moment voor elke groepsafspraak.
	</h3>
	<a
		href="/afspraak/maken"
		class="mx-auto block w-fit rounded-lg bg-pink-700 px-4 py-2 text-lg font-semibold text-white shadow transition hover:bg-pink-800 dark:bg-pink-800 dark:text-zinc-100 dark:hover:bg-pink-900"
	>
		Afspraak maken
	</a>
	<!-- <Button as="link" href="/afspraak/maken" size="lg" color="primary" class="mx-auto">
		Afspraak maken
	</Button> -->
</header>

<section class="mt-24">
	<h3 class="font-display mb-4 text-center text-xl font-semibold">Waarom Prikkert?</h3>
	<p class="class mx-auto mb-8 max-w-120 text-center text-balance text-zinc-600 dark:text-zinc-300">
		Datumprikken kan ook zonder verdienmodel. Daarom doet Prikkert vier simpele beloftes.
	</p>
	<div class="grid gap-4 sm:grid-cols-2">
		<div
			class="rounded-lg border from-zinc-900 to-pink-700/5 px-6 py-5 dark:border-zinc-800 dark:bg-gradient-to-tl"
		>
			<div class="mb-4 flex items-center gap-4">
				<div
					class="aspect-square w-fit rounded-lg bg-pink-500/20 p-2.5 text-pink-700 dark:text-pink-100"
				>
					<IconMoneybag />
				</div>
				<h4 class="font-display text-xl font-medium text-zinc-800 dark:text-zinc-200">
					Altijd gratis
				</h4>
			</div>
			<p class="font-[350] text-zinc-600 text-balance dark:text-pink-50/70">
				Geen verborgen kosten, geen verrassingen. Alle functies van Prikkert blijven altijd gratis.
			</p>
		</div>
		<div
			class="rounded-lg border from-zinc-900 to-pink-700/5 px-6 py-5 dark:border-zinc-800 dark:bg-gradient-to-tl"
		>
			<div class="mb-4 flex items-center gap-4">
				<div
					class="aspect-square w-fit rounded-lg bg-pink-500/20 p-2.5 text-pink-700 dark:text-pink-100"
				>
					<IconAd />
				</div>
				<h4 class="font-display text-xl font-medium text-zinc-800 dark:text-zinc-200">
					Nooit reclame
				</h4>
			</div>
			<p class="font-[350] text-zinc-600 text-balance dark:text-pink-50/70">
				Waarom zou je langs eindeloze advertenties moeten scrollen? Prikkert houdt het reclamevrij.
			</p>
		</div>
		<div
			class="rounded-lg border from-zinc-900 to-pink-700/5 px-6 py-5 dark:border-zinc-800 dark:bg-gradient-to-tl"
		>
			<div class="mb-4 flex items-center gap-4">
				<div
					class="aspect-square w-fit rounded-lg bg-pink-500/20 p-2.5 text-pink-700 dark:text-pink-100"
				>
					<IconShield />
				</div>
				<h4 class="font-display text-xl font-medium text-zinc-800 dark:text-zinc-200">
					Privacy voorop
				</h4>
			</div>
			<p class="font-[350] text-zinc-600 text-balance dark:text-pink-50/70">
				Jouw gegevens zijn van jou. Prikkert deelt niets met anderen en bewaart alles veilig in de
				EU.
			</p>
		</div>
		<div
			class="rounded-lg border from-zinc-900 to-pink-700/5 px-6 py-5 dark:border-zinc-800 dark:bg-gradient-to-tl"
		>
			<div class="mb-4 flex items-center gap-4">
				<div
					class="aspect-square w-fit rounded-lg bg-pink-500/20 p-2.5 text-pink-700 dark:text-pink-100"
				>
					<IconCode />
				</div>
				<h4 class="font-display text-xl font-medium text-zinc-800 dark:text-zinc-200">
					Open source
				</h4>
			</div>
			<p class="font-[350] text-zinc-600 text-balance dark:text-pink-50/70">
				Iedereen kan de broncode lezen en verbeteren, want Prikkert heeft niets te verbergen.
			</p>
		</div>
	</div>
</section>
