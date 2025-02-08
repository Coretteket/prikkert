import { getSessions } from '@/lib/server/events'

export async function load({ locals }) {
	const sessions = await getSessions(locals.session)

	return { sessions }
}
