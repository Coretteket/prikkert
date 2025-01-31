import { getEventsByUser } from '@/lib/server/events'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session } }) {
	if (!session) throw redirect(307, '/inloggen')

	const events = await getEventsByUser(session.userId)

	return { events }
}
