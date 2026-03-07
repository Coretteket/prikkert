import { page } from '$app/state'

import { capitalizeFirst } from '../utils'
import { getContent } from '../content'

function formatTitle(title: string) {
	return `${capitalizeFirst(title)} · Prikkert`
}

export function getPageMeta() {
	const { defaultDescription } = getContent()

	switch (page.route.id) {
		case '/afspraak/aanmaken': {
			return { title: formatTitle('Afspraak aanmaken'), description: defaultDescription }
		}
		case '/afspraak/reageren/[eventId]': {
			return {
				title: formatTitle(page.data.eventTitle ?? 'Beschikbaarheid doorgeven'),
				description: defaultDescription,
			}
		}
		case '/afspraak/overzicht/[eventId]': {
			return {
				title: formatTitle(page.data.eventTitle ?? 'Afspraakoverzicht'),
				description: defaultDescription,
			}
		}
		case '/afspraken': {
			return { title: formatTitle('Afspraken'), description: defaultDescription }
		}
		case '/[page]': {
			return { title: formatTitle(page.params.page!), description: defaultDescription }
		}
		case '/vs/plennur': {
			return {
				title: formatTitle('Gratis Plennur alternatief'),
				description:
					'Prikkert is het gratis alternatief voor Plennur. Plan elke groepsafspraak zonder account, reclame of verborgen kosten.',
			}
		}
		case '/vs/datumprikker': {
			return {
				title: formatTitle('Datumprikker alternatief zonder reclame'),
				description:
					'Prikkert is het reclamevrije alternatief voor Datumprikker. Plan gratis elke groepsafspraak zonder tracking of advertenties.',
			}
		}
		default: {
			return { title: 'Prikkert · Samen plannen, zo geprikt', description: defaultDescription }
		}
	}
}
