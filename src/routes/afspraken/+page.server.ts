import { getEventsForSession } from '@/lib/server/events'

export const load = async ({ locals }) => {
	const events = await getEventsForSession(locals.session)
	return { events }
}
