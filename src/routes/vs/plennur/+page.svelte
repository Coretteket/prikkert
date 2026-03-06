<script lang="ts">
	import ComparisonRow from '@/components/comparison-row.svelte'
	import FaqItem from '@/components/faq-item.svelte'
	import Button from '@/components/button.svelte'
	import Step from '@/components/step.svelte'
	import { url } from '@/shared/url'

	const steps = [
		{
			bold: 'Maak een afspraak',
			normal: /* @wc-include */ 'met de datums en tijden die je wil voorstellen.',
		},
		{
			bold: 'Verstuur de link',
			normal: /* @wc-include */ 'zodat deelnemers hun beschikbaarheid kunnen doorgeven.',
		},
		{
			bold: 'Bekijk het resultaat',
			normal: /* @wc-include */ 'en kies samen de beste datum voor de afspraak.',
		},
	]
</script>

<header class="mt-8 mb-24 space-y-4 sm:mt-10 sm:mb-28">
	<h1
		class="mb-8 text-center text-[2.2rem] leading-[1.2] font-[650] text-neutral-900 xs:text-[2.5rem] sm:text-5xl dark:text-neutral-100"
	>
		Plennur alternatief<br /> zonder prijskaartje
	</h1>
	<h2
		class="mx-auto mb-8 text-center text-xl leading-normal text-balance text-neutral-700 dark:text-neutral-300"
	>
		Prikkert is het <strong class="font-bold text-pink-600 dark:text-pink-50">gratis</strong>
		alternatief voor Plennur.<br />
		Plan elke groepsafspraak
		<strong class="font-bold text-pink-600 dark:text-pink-50">zonder reclame</strong>.
	</h2>
	<Button as="link" href={url('/afspraak/aanmaken')} variant="primary" size="lg" class="mx-auto">
		Afspraak aanmaken
	</Button>
</header>

<section class="mb-24">
	<h2 class="mb-6 text-center text-xl font-semibold xs:text-2xl">Prikkert of Plennur?</h2>
	<p
		class="mx-auto mb-12 max-w-100 text-center font-medium text-balance text-neutral-600 dark:text-neutral-300"
	>
		Beide helpen je met plannen, maar met Prikkert doe je dat gratis.
	</p>

	<div class="mb-8 grid gap-y-4">
		<ComparisonRow icon="tabler--pig-money">
			{#snippet left()}
				Prikkert heeft geen paywall en <strong class="font-[650] text-pink-600 dark:text-pink-50">
					geen verborgen kosten
				</strong>.
			{/snippet}
			{#snippet right()}
				Plennur is
				<strong class="font-[650] text-neutral-800 dark:text-neutral-50/90">kost geld</strong> zodra je
				meer dan 5 mensen uitnodigt.
			{/snippet}
		</ComparisonRow>

		<ComparisonRow icon="tabler--user-square-rounded">
			{#snippet left()}
				Prikkert hoeft je email niet. Je hebt
				<strong class="font-[650] text-pink-600 dark:text-pink-50">geen account nodig</strong>.
			{/snippet}
			{#snippet right()}
				Plennur <strong class="font-[650] text-neutral-800 dark:text-neutral-50/90">
					vereist een account
				</strong> om een datumprikker aan te maken.
			{/snippet}
		</ComparisonRow>

		<ComparisonRow icon="tabler--folder-open">
			{#snippet left()}
				Prikkert is
				<strong class="font-[650] text-pink-600 dark:text-pink-50">open</strong>. Iedereen kan de
				broncode inzien en hergebruiken.
			{/snippet}
			{#snippet right()}
				Plennur is een
				<strong class="font-[650] text-neutral-800 dark:text-neutral-50/90">black box</strong>, dus
				je kan niet zonder hun bedrijf.
			{/snippet}
		</ComparisonRow>
	</div>
</section>

<section class="mb-24">
	<h2 class="mb-6 text-center text-xl font-semibold xs:text-2xl">Aan de slag in drie stappen</h2>
	<p
		class="mx-auto mb-12 max-w-100 text-center font-medium text-balance text-neutral-600 dark:text-neutral-300"
	>
		Je kan zonder account meteen beginnen met plannen.
	</p>
	<div class="mx-auto max-w-120">
		{#each steps as step, i}
			<Step n={i + 1} bold={step.bold} normal={step.normal} />
		{/each}
	</div>
	<Button as="link" href={url('/afspraak/aanmaken')} variant="primary" class="mx-auto mt-12">
		Begin met plannen
	</Button>
</section>

<section>
	<h2 class="mb-6 text-center text-xl font-semibold xs:text-2xl" id="faq">Veelgestelde vragen</h2>
	<p
		class="mx-auto mb-12 max-w-100 text-center font-medium text-balance text-neutral-600 dark:text-neutral-300"
	>
		Alle antwoorden over hoe Prikkert werkt.
	</p>
	<div class="mx-auto max-w-130">
		<FaqItem question="Wat is het verdienmodel van Prikkert?" open>
			Prikkert hoeft geen geld te verdienen. Het is een passieproject met verwaarloosbare kosten,
			waardoor het geen advertenties of betaalmuren nodig heeft. Prikkert is en blijft dus gratis en
			reclamevrij voor iedereen.
		</FaqItem>
		<FaqItem question="Hoe veilig is mijn data bij Prikkert?">
			Prikkert weigert je gegevens te verkopen en houdt geen surfgedrag bij. Jouw informatie wordt
			alleen opgeslagen binnen de Europese Unie en wordt automatisch gewist na de bewaartermijn. Je
			kan zonder account of zelfs volledig anononiem meteen aan de slag. Lees meer in de
			<a href={url('/privacy')} class="underline">privacyverklaring</a>.
		</FaqItem>
		<FaqItem question="Werkt Prikkert zonder account?">
			Ja. Prikkert vraagt nergens om een e-mailadres of wachtwoord. Pas je planning later eenvoudig
			aan via precies hetzelfde apparaat en dezelfde browser. Deel je als organisator de beheerlink?
			Dan bewerk je de afspraak moeiteloos vanaf andere schermen of samen met vrienden. Lees meer in
			de
			<a href={url('/privacy')} class="underline">privacyverklaring</a>.
		</FaqItem>
		<FaqItem question="Is Prikkert open source?">
			Zeker weten. Prikkert is open source software, waardoor iedereen het systeem tot in detail kan
			inspecteren. Vind de complete broncode direct terug op
			<a href="https://codeberg.org/qcoret/prikkert" target="_blank" class="underline">Codeberg</a>
			en hergebruik deze vrijuit volgens de voorwaarden van de
			<a
				href="https://codeberg.org/qcoret/prikkert/src/branch/main/LICENSE"
				target="_blank"
				class="underline"
			>
				European Union Public License
			</a>.
		</FaqItem>
		<FaqItem question="Wie is de maker van Prikkert?">
			<a href="https://quintencoret.nl" target="_blank" class="underline">Quinten Coret</a> lanceerde
			Prikkert als passieproject. Hij bouwde de website vanuit de ijzersterke overtuiging dat een datum
			plannen gratis, advertentievrij en privacyvriendelijk hoort te zijn. Prikkert vormt zo zijn kleine
			protest tegen de verkuttificatie van het internet.
		</FaqItem>
	</div>

	<div class="mx-auto flex w-fit flex-wrap gap-4">
		<Button as="link" href={url('/afspraak/aanmaken')} variant="primary" class="mx-auto mt-12">
			Afspraak aanmaken
		</Button>
		<Button as="link" href="mailto:prikkert@qntn.io" variant="secondary" class="mx-auto mt-12">
			Contact opnemen
		</Button>
	</div>
</section>
