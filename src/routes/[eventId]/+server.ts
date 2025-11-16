import { redirect } from '@sveltejs/kit'

import { dev } from '$app/environment'

export function GET({ params }) {
	redirect(dev ? 307 : 308, `/afspraak/invullen/` + params.eventId)
}
