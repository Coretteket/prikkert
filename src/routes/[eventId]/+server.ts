import { dev } from '$app/environment'
import { redirect } from '@sveltejs/kit'

export function GET({ params }) {
	redirect(dev ? 307 : 308, `/afspraak/invullen/` + params.eventId)
}
