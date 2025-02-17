import { IconAd, IconCode, IconMoneybag, IconShield } from '@tabler/icons-svelte'

export const promises = [
	{
		icon: IconMoneybag,
		title: 'Altijd gratis',
		description:
			'Geen verborgen kosten, geen verrassingen. Alle functies van Prikkert blijven altijd gratis.',
	},
	{
		icon: IconAd,
		title: 'Nooit reclame',
		description:
			'Waarom zou je langs eindeloze advertenties moeten scrollen? Prikkert houdt het reclamevrij.',
	},
	{
		icon: IconShield,
		title: 'Privacy voorop',
		description:
			'Zonder account, zonder zorgen. Prikkert verkoopt je gegevens niet en slaat alles veilig op in de EU.',
	},
	{
		icon: IconCode,
		title: 'Open source',
		description:
			'Iedereen kan de broncode lezen en verbeteren, want Prikkert heeft niets te verbergen.',
	},
]

export const steps = [
	{
		bold: 'Maak een afspraak aan',
		normal: 'met een titel en alle datumopties, plus extra informatie als je dat wil.',
	},
	{
		bold: 'Deel de link',
		normal: 'via WhatsApp, e-mail of elk ander kanaal om mensen uit te nodigen.',
	},
	{
		bold: 'Prik',
		normal: 'het beste moment voor de afspraak, als iedereen heeft gereageerd.',
	},
]

export const faq = [
	{
		question: 'Hoe verschilt Prikkert van Datumprikker.nl?',
		answer:
			"<a href='https://datumprikker.nl' rel='nofollow' target='_blank' class='underline'>Datumprikker.nl</a> is populair, maar staat bordevol reclames en deelt je gegevens standaard met 277 bedrijven. Bovendien heb je een account nodig en zijn sommige functies betaald. Prikkert is een gratis, reclamevrij en privacyvriendelijk alternatief.",
	},
	{
		question: 'Hoe is Prikkert gratis en reclamevrij?',
		answer:
			'Prikkert is geen bedrijf, maar een hobbyproject van een enthousiaste programmeur. Hij betaalt daarom graag €4,53 per maand om Prikkert in de lucht te houden, waardoor iedereen gratis, reclamevrij, en privacyvriendelijk datums kan prikken.',
	},
	{
		question: 'Wie heeft Prikkert gemaakt?',
		answer:
			"Prikkert is een hobbyproject van Quinten Coret. Als masterstudent en ontwikkelaar bouwde hij Prikkert in zijn weekenden en avonduren, gedreven door zijn passie voor programmeren en zijn hekel aan reclames. Lees meer op <a href='https://qntn.io' target='_blank' class='underline'>qntn.io</a>.",
	},
	{
		question: 'Hoe beschermt Prikkert je privacy?',
		answer: "Prikkert slaat zo min mogelijk persoonsgegevens op. Je hoeft geen account aan te maken, en als je meerdere afspraken aanmaakt, worden die op geen enkele manier met elkaar verbonden. Ook gebruikt Prikkert alleen <a href='https://www.autoriteitpersoonsgegevens.nl/themas/internet-slimme-apparaten/cookies/wat-zijn-cookies' target='_blank' class='underline'>functionele cookies</a>, en word je nooit getrackt. Alle gegevens worden veilig opgeslagen binnen de Europese Unie, en niet verkocht aan derden."
	},
	{
		question: 'Wat betekent het dat Prikkert open-source is?',
		answer:
			"Open-source betekent dat iedereen de broncode van Prikkert kan lezen en verbeteren. Prikkert is in licentie gegeven krachtens de <a href='https://github.com/coretteket/prikkert/?tab=EUPL-1.2-1-ov-file#readme' target='_blank' class='underline'>EUPL</a>, wat betekent dat iedereen onder bepaalde voorwaarden een eigen versie mag publiceren. De volledige broncode van Prikkert is te vinden op <a href='https://github.com/coretteket/prikkert' target='_blank' class='underline'>GitHub</a>.",
	},
]
