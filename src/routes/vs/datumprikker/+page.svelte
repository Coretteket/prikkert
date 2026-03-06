<script lang="ts">
	import ComparisonRow from '@/components/comparison-row.svelte'
	import FaqItem from '@/components/faq-item.svelte'
	import Button from '@/components/button.svelte'
	import Step from '@/components/step.svelte'
	import { url } from '@/shared/url'

	const steps = [
		{
			bold: 'Kies alle datums',
			normal: /* @wc-include */ 'en tijden waarop de afspraak zou kunnen plaatsvinden.',
		},
		{
			bold: 'Deel de link',
			normal: /* @wc-include */ 'zodat iedereen hun beschikbaarheid kan doorgeven.',
		},
		{
			bold: 'Bekijk het overzicht',
			normal: /* @wc-include */ 'en prik het moment dat het beste uitkomt.',
		},
	]
</script>

<header class="mt-8 mb-24 space-y-4 sm:mt-10 sm:mb-28">
	<h1
		class="mb-8 text-center text-[2.2rem] leading-[1.2] font-[650] text-neutral-900 xs:text-[2.5rem] sm:text-5xl dark:text-neutral-100"
	>
		Datumprikker alternatief<br /> zonder reclame
	</h1>
	<h2
		class="mx-auto mb-8 text-center text-xl leading-normal text-balance text-neutral-700 dark:text-neutral-300"
	>
		Prikkert is het <strong class="font-bold text-pink-600 dark:text-pink-50">reclamevrije</strong>
		alternatief voor Datumprikker.<br />
		Plan <strong class="font-bold text-pink-600 dark:text-pink-50">gratis</strong> elke groepsafspraak.
	</h2>
	<Button as="link" href={url('/afspraak/aanmaken')} variant="primary" size="lg" class="mx-auto">
		Afspraak aanmaken
	</Button>
</header>

<section class="mb-24">
	<h2 class="mb-6 text-center text-xl font-semibold xs:text-2xl">Prikkert of Datumprikker?</h2>
	<p
		class="mx-auto mb-12 max-w-100 text-center font-medium text-balance text-neutral-600 dark:text-neutral-300"
	>
		Allebei helpen je datums te prikken, maar Prikkert toont je nooit reclame.
	</p>

	<div class="mb-8 grid gap-y-4">
		<ComparisonRow icon="tabler--pig-money">
			{#snippet left()}
				Prikkert is <strong class="font-[650] text-pink-600 dark:text-pink-50">
					100% gratis
				</strong> en dat zal altijd zo blijven.
			{/snippet}
			{#snippet right()}
				Datumprikker is
				<strong class="font-semibold text-neutral-800 dark:text-neutral-50/90">
					niet gratis
				</strong>. Je betaalt met je geld of met je data.
			{/snippet}
		</ComparisonRow>

		<ComparisonRow icon="tabler--ad-off">
			{#snippet left()}
				Met Prikkert plan je altijd
				<strong class="font-[650] text-pink-600 dark:text-pink-50">zonder reclame</strong>.
			{/snippet}
			{#snippet right()}
				Op Datumprikker verdrink je in irritante
				<strong class="font-semibold text-neutral-800 dark:text-neutral-50/90">
					reclame en popups
				</strong>.
			{/snippet}
		</ComparisonRow>

		<ComparisonRow icon="tabler--shield-lock">
			{#snippet left()}
				Prikkert <strong class="font-[650] text-pink-600 dark:text-pink-50">trackt je niet</strong> en
				verkoopt je gegevens nooit.
			{/snippet}
			{#snippet right()}
				Als je niet oplet, deelt Datumprikker jouw gegevens met <strong
					class="font-semibold text-neutral-800 dark:text-neutral-50/90"
				>
					414 bedrijven
				</strong>.
			{/snippet}
		</ComparisonRow>

		<ComparisonRow icon="tabler--folder-open">
			{#snippet left()}
				Prikkert is <strong class="font-[650] text-pink-600 dark:text-pink-50">transparant</strong>.
				Iedereen kan de code lezen en verbeteren.
			{/snippet}
			{#snippet right()}
				Datumprikker is een
				<strong class="font-semibold text-neutral-800 dark:text-neutral-50/90">black box</strong>,
				dus je bent afhankelijk van hun bedrijf.
			{/snippet}
		</ComparisonRow>
	</div>
</section>

<section class="mb-24">
	<h2 class="mb-6 text-center text-xl font-semibold xs:text-2xl">Zo werkt Prikkert</h2>
	<p
		class="mx-auto mb-12 max-w-100 text-center font-medium text-balance text-neutral-600 dark:text-neutral-300"
	>
		In drie simpele stappen plan je jouw groepsafspraak.
	</p>
	<div class="mx-auto max-w-120">
		{#each steps as step, i}
			<Step n={i + 1} bold={step.bold} normal={step.normal} />
		{/each}
	</div>
	<Button as="link" href={url('/afspraak/aanmaken')} variant="primary" class="mx-auto mt-12">
		Begin met prikken
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
		<FaqItem question="Hoe verdient Prikkert geld?" open>
			Geld verdienen is niet het doel van Prikkert. Dit passieproject draait op verwaarloosbare
			kosten en heeft daarom geen enkele vorm van reclame of betaalmuren nodig. Prikkert garandeert
			iedereen een volledig gratis en advertentievrije ervaring.
		</FaqItem>
		<FaqItem question="Wat doet Prikkert met mijn gegevens?">
			Jij bent bij Prikkert niet het product. Prikkert verkoopt je gegevens nooit en trackt je niet.
			Jouw data blijft altijd binnen de Europese Unie en verdwijnt automatisch zodra je deze niet
			meer nodig hebt. Omdat je geen account aanmaakt kan je direct starten. Lees meer in de
			<a href={url('/privacy')} class="underline">privacyverklaring</a>.
		</FaqItem>
		<FaqItem question="Heb ik een account nodig voor Prikkert?">
			Nee, Prikkert vraagt niet om een e-mail of wachtwoord, maar herkent je via een cookie in je
			browser. Wil je later je afspraak of beschikbaarheid aanpassen? Doe dit dan op hetzelfde
			apparaat en in dezelfde browser. Als organisator deel je een speciale link om de afspraak ook
			op een ander apparaat, of samen met iemand anders, te beheren. Lees meer in de
			<a href={url('/privacy')} class="underline">privacyverklaring</a>.
		</FaqItem>
		<FaqItem question="Is Prikkert open source?">
			Ja. Prikkert is open source zodat iedereen de techniek onder de motorkap kan controleren. De
			broncode staat openbaar op
			<a href="https://codeberg.org/qcoret/prikkert" target="_blank" class="underline">Codeberg</a>
			en mag door iedereen worden hergebruikt onder de
			<a
				href="https://codeberg.org/qcoret/prikkert/src/branch/main/LICENSE"
				target="_blank"
				class="underline"
			>
				European Union Public License
			</a>.
		</FaqItem>
		<FaqItem question="Wie heeft Prikkert ontwikkeld?">
			<a href="https://quintencoret.nl" target="_blank" class="underline">Quinten Coret</a> bouwde Prikkert
			als passieproject. Hij ontwikkelde de tool met het simpele idee dat datumprikken prima zonder kosten,
			reclame en tracking kan. Prikkert is zijn kleine vorm van verzet tegen de verkuttificatie van het
			internet.
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
