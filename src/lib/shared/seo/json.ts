// @wc-ignore-file
import { env } from '$env/dynamic/public'

import { page } from '$app/state'

import { getContent } from '../content'
import { getPageMeta } from './meta'

export function generateJSONLD() {
	const isHome = page.url.pathname === '/'
	const { promises, faq } = getContent()
	const meta = getPageMeta()
	const origin = env.PUBLIC_ORIGIN

	const baseSchema: {
		'@context': string
		'@graph': (Record<string, unknown> & { '@type': string })[]
	} = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': `${origin}/#website`,
				name: 'Prikkert',
				description: meta.description,
				url: origin,
				publisher: { '@type': 'Person', name: 'Quinten Coret', url: 'https://quintencoret.nl' },
			},
			{
				'@type': 'SoftwareApplication',
				'@id': `${origin}/#software`,
				name: 'Prikkert',
				description: meta.description,
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
				'@id': `${origin}/#webpage`,
				url: origin,
				name: meta.title,
				inLanguage: 'nl-NL',
				potentialAction: {
					'@type': 'CreateAction',
					name: 'Afspraak aanmaken',
					target: { '@type': 'EntryPoint', urlTemplate: `${origin}/afspraak/aanmaken` },
				},
			},
			{
				'@type': 'FAQPage',
				'@id': `${origin}/#faq`,
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
			'@id': `${origin}${page.url.pathname}/#webpage`,
			name: meta.title,
			url: `${origin}${page.url.pathname}`,
			isPartOf: { '@id': `${origin}/#website` },
		})
	}

	return JSON.stringify(baseSchema)
}
