<script lang="ts"></script>

<svelte:head>
	<title>Voorwaarden - Prikkert</title>
</svelte:head>

<article class="mx-auto max-w-130 space-y-4 text-neutral-700 dark:text-neutral-300">
	<h1 class="font-display mb-6 text-2xl font-[550] text-neutral-950 dark:text-neutral-50">
		Algemene voorwaarden
	</h1>
	<p class="mb-10 text-lg font-[350] text-neutral-700 dark:text-neutral-300">
		Met Prikkert kan je samen afspraken plannen. Je gaat akkoord met deze voorwaarden door Prikkert
		te gebruiken.
	</p>

	{@render heading('Gratis dienst')}
	<p>
		Prikkert is een gratis dienst van Quinten Coret ({@render link(
			'mailto:prikkert@qntn.io',
			'prikkert@qntn.io',
		)}). De broncode is {@render link('https://github.com/coretteket/prikkert', 'open source')},
		vrijgegeven voor hergebruik onder de
		{@render link(
			'https://github.com/Coretteket/prikkert/blob/main/LICENSE',
			'European Union Public License',
		)}. Het steven is dat de dienst altijd kosteloos en reclamevrij blijft voor gebruikers.
	</p>

	{@render heading('Gebruik')}
	<p>
		Je mag Prikkert vrij gebruiken voor het plannen van afspraken. Het is niet toegestaan de dienst
		te gebruiken op een manier die schadelijk is voor de dienst zelf of voor anderen, zoals het
		plaatsen van illegale inhoud of het onredelijk belasten van de dienst.
	</p>

	{@render heading('Aansprakelijkheid')}
	<p>
		De ontwikkelaar van Prikkert is niet aansprakelijk voor enige schade die voortvloeit uit het
		gebruik van de dienst. De gebruiker is zelf volledig verantwoordelijk voor teksten die via
		Prikkert wordt geplaatst.
	</p>

	{@render heading('Beschikbaarheid')}
	<p>
		Prikkert wordt aangeboden zoals het is. Hoewel er gestreefd wordt naar een goede werking en
		beschikbaarheid, kan er geen garantie worden gegeven dat de dienst foutloos of ononderbroken
		werkt.
	</p>

	{@render heading('Wijzigingen')}
	<p>
		Prikkert kan deze voorwaarden wijzigen. De dienst zelf kan ook worden aangepast of stopgezet. De
		volledige versiegeschiedenis van de dienst en voorwaarden is beschikbaar op
		{@render link('https://github.com/coretteket/prikkert', 'GitHub')}.
	</p>

	{@render heading('Toepasselijk recht')}
	<p>Op deze voorwaarden is Nederlands recht van toepassing.</p>
</article>

{#snippet heading(value: string)}
	<h1 class="mt-8 text-lg font-medium text-neutral-950 dark:text-neutral-50">
		{value}
	</h1>
{/snippet}

{#snippet link(href: string, text: string)}
	<a {href} target="_blank" class="underline">{text}</a>
{/snippet}
