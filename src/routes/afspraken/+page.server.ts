import { getEventsForSession } from '@/server/events'

export const load = async ({ locals }) => {
	const events = await getEventsForSession(locals.session)
	return { events }
}
