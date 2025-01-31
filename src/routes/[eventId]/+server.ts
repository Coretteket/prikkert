import { redirect } from '@sveltejs/kit'

export function GET({ params: { eventId } }) {
	throw redirect(308, '/afspraak/invullen/' + eventId)
}
