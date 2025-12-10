<script lang="ts"></script>

<svelte:head>
	<title>Privacy - Prikkert</title>
</svelte:head>

<article class="mx-auto max-w-130 space-y-4 text-neutral-700 dark:text-neutral-300">
	<h1 class="font-display mb-6 text-2xl font-[550] text-neutral-950 dark:text-neutral-50">
		Privacyverklaring
	</h1>
	<p class="mb-10 text-lg font-[350] text-neutral-700 dark:text-neutral-300">
		Met Prikkert kan je samen afspraken plannen. Het verwerkt alleen de gegevens die nodig zijn om
		dat mogelijk te maken.
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

	{@render heading('Persoonsgegevens')}
	<p>
		Prikkert verwerkt alleen de volgende persoonsgegevens, die nodig zijn om het plannen van een
		groepsafspraak mogelijk te maken (<a
			href="https://www.autoriteitpersoonsgegevens.nl/themas/basis-avg/avg-algemeen/grondslagen-avg-uitgelegd#grondslag-overeenkomst"
			target="_blank"
			class="underline">grondslag uitvoering overeenkomst</a
		>). Je hebt geen account nodig.
	</p>
	<p>
		Een organisator verstrekt een titel en datumopties. Het is optioneel om hun naam en een
		beschrijving toe te voegen.
	</p>
	<p>
		Een deelnemer verstrekt hun naam en beschikbaarheid voor de datumopties. Een organisator kan ook
		anonieme reacties toestaan.
	</p>

	<p>
		Om Prikkert te beveiligen worden daarnaast logs bijgehouden met IP-adressen van verzoeken ({@render link(
			'https://www.autoriteitpersoonsgegevens.nl/themas/basis-avg/avg-algemeen/grondslagen-avg-uitgelegd#grondslag-gerechtvaardigd-belang',
			'grondslag gerechtvaardigd belang',
		)}).
	</p>

	{@render heading('Zichtbaarheid')}
	<p>
		Prikkert deelt individuele reacties van deelnemers standaard alleen met de organisator van de
		afspraak.
	</p>

	<p>
		Geanonimiseerde beschikbaarheid (aantal per datumoptie) is zichtbaar voor iedereen met de link
		naar de afspraak.
	</p>

	<p>
		De organisator kan ervoor kiezen om ook individuele reacties zichtbaar te maken voor iedereen
		met de link naar de afspraak. Dit staat in dat geval aangegeven bij het reageren.
	</p>

	{@render heading('Derden')}
	<p>
		Prikkert verkoopt jouw gegevens nooit. Gegevens worden met geen enkele derde partij gedeeld,
		behalve met de hostingdienst of indien wettelijk verplicht.
	</p>

	<p>
		Je wordt op geen enkele manier getrackt. Prikkert gebruikt alleen {@render link(
			'https://www.autoriteitpersoonsgegevens.nl/themas/internet-slimme-apparaten/cookies/wat-zijn-cookies',
			'functionele cookies',
		)} om de dienst te laten werken.
	</p>

	{@render heading('Bewaren')}
	<p>
		Prikkert draait op infrastructuur van Hetzner Online GmbH, waarmee een {@render link(
			'https://www.hetzner.com/AV/DPA_en.pdf',
			'verwerkersovereenkomst',
		)} is gesloten. Gegevens worden altijd verwerkt binnen de Europese Unie.
	</p>

	<p>
		De ontwikkelaar neemt passende maatregelen tegen misbruik, verlies en onbevoegde toegang.
		Gegevens worden niet langer bewaard dan nodig.
	</p>

	<p>
		Een afspraak en alle bijbehorende reacties worden drie maanden na de laatste datumoptie van de
		afspraak automatisch verwijderd. Logs met IP-adressen worden maximaal een maand bewaard.
	</p>

	{@render heading('Rechten')}
	<p>
		Je hebt {@render link(
			'https://www.autoriteitpersoonsgegevens.nl/themas/basis-avg/privacyrechten-avg',
			'onder de AVG',
		)} het recht op informatie, inzage, rectificatie, verwijdering, beperking van verwerking en dataportabiliteit.
		Prikkert probeert deze rechten zo goed mogelijk te faciliteren via de website.
	</p>
	<p>
		Lukt dit niet? Neem dan contact op via {@render link(
			'mailto:prikkert@qntn.io',
			'prikkert@qntn.io',
		)}. Je hebt ook het recht om een klacht in te dienen bij de
		{@render link(
			'https://www.autoriteitpersoonsgegevens.nl/een-tip-of-klacht-indienen-bij-de-ap',
			'Autoriteit Persoonsgegevens',
		)}.
	</p>

	{@render heading('Wijzigingen')}
	<p>
		Prikkert kan deze privacyverklaring wijzigen. De volledige versiegeschiedenis van de verklaring is
		beschikbaar op
		{@render link('https://github.com/coretteket/prikkert', 'GitHub')}.
	</p>
</article>

{#snippet heading(value: string)}
	<h1 class="mt-8 text-lg font-medium text-neutral-950 dark:text-neutral-50">
		{value}
	</h1>
{/snippet}

{#snippet link(href: string, text: string)}
	<a {href} target="_blank" class="underline">{text}</a>
{/snippet}
