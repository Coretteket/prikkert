import type { PageServerLoad } from './$types'
import { getEventsForSession } from '@/lib/server/events'

export const load: PageServerLoad = async ({ locals }) => {
	const events = await getEventsForSession(locals.session)
	return { events }
}
