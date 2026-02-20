import { page } from '$app/state'

import { faq, promises } from './content'
import { capitalizeFirst } from './utils'

export const description =
	'Gratis en reclamevrij het beste moment prikken voor elke groepsafspraak.'

function formatTitle(title: string) {
	return `${capitalizeFirst(title)} · Prikkert`
}

export function getPageTitle() {
	switch (page.route.id) {
		case '/afspraak/aanmaken': {
			return formatTitle('Aanmaken')
		}
		case '/afspraak/reageren/[eventId]': {
			return formatTitle('Reageren')
		}
		case '/afspraak/overzicht/[eventId]': {
			return formatTitle('Overzicht')
		}
		case '/afspraken': {
			return formatTitle('Afspraken')
		}
		case '/[page]': {
			return formatTitle(page.params.page!)
		}
		default: {
			return 'Prikkert · Samen plannen, zo geprikt'
		}
	}
}

export function generateJSONLD() {
	const isHome = page.url.pathname === '/'

	const baseSchema: {
		'@context': string
		'@graph': (Record<string, unknown> & { '@type': string })[]
	} = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': 'https://prikkert.nl/#website',
				name: 'Prikkert',
				description: description,
				url: 'https://prikkert.nl',
				publisher: { '@type': 'Person', name: 'Quinten Coret', url: 'https://quintencoret.nl' },
			},
			{
				'@type': 'SoftwareApplication',
				'@id': 'https://prikkert.nl/#software',
				name: 'Prikkert',
				description: description,
				operatingSystem: 'All',
				applicationCategory: 'UtilitiesApplication',
				offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
				featureList: promises.map((p) => p.title).join(', '),
			},
		],
	}

	// Only add the FAQ and heavy descriptions to the Homepage
	if (isHome) {
		const homeExtras = [
			{
				'@type': 'WebPage',
				'@id': 'https://prikkert.nl/#webpage',
				url: 'https://prikkert.nl',
				name: getPageTitle(),
				inLanguage: 'nl-NL',
				potentialAction: {
					'@type': 'CreateAction',
					name: 'Afspraak aanmaken',
					target: { '@type': 'EntryPoint', urlTemplate: 'https://prikkert.nl/afspraak/aanmaken' },
				},
			},
			{
				'@type': 'FAQPage',
				'@id': 'https://prikkert.nl/#faq',
				mainEntity: faq.map((f) => ({
					'@type': 'Question',
					name: f.question,
					acceptedAnswer: {
						'@type': 'Answer',
						text: f.answer.replaceAll(/<[^>]+>/g, '').replaceAll('&shy;', ''),
					},
				})),
			},
		]

		baseSchema['@graph'].push(...homeExtras)
	} else {
		baseSchema['@graph'].push({
			'@type': 'WebPage',
			'@id': `https://prikkert.nl${page.url.pathname}/#webpage`,
			name: getPageTitle(),
			url: `https://prikkert.nl${page.url.pathname}`,
			isPartOf: { '@id': 'https://prikkert.nl/#website' },
		})
	}

	return JSON.stringify(baseSchema)
}
