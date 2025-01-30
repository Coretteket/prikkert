import { redirect } from '@sveltejs/kit'

export function GET({ params }) {
	throw redirect(308, `/afspraak/${params.eventId}/invullen`)
}
