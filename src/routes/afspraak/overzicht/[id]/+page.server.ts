import { getEvent } from '@/lib/server/events'
import { error } from '@sveltejs/kit'

export async function load({ params: { id } }) {
	const event = await getEvent(id)

	if (!event) throw error(404, 'Afspraak niet gevonden')

	return { event }
}
