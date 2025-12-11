import { page } from '$app/state'

import { capitalizeFirst } from './utils'

function formatTitle(title: string) {
	return `${capitalizeFirst(title)} · Prikkert`
}

export function getPageTitle() {
	switch (page.route.id) {
		case '/afspraak/aanmaken': {
			return formatTitle('Afspraak aanmaken')
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
			return 'Prikkert'
		}
	}
}
