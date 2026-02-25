// @wc-ignore-file
import { page } from '$app/state'

import { description, getPageTitle } from './meta'
import { getContent } from '../content'

export function generateJSONLD() {
	const isHome = page.url.pathname === '/'
	const { promises, faq } = getContent()

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
