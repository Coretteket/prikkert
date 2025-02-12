import { getEvent } from '@/lib/server/events'
import { getPattern } from '@/lib/server/patterns.js'
import { error } from '@sveltejs/kit'

export async function load({ locals, params: { id } }) {
	const event = await getEvent(id, locals.session.get(id)?.id)

	if (!event) throw error(404, 'Afspraak niet gevonden')

	const pattern = getPattern(id)

	return { event, pattern }
}
