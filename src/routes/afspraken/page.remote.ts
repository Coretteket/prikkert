import { query, getRequestEvent } from '$app/server'

import { getEventsForSession } from '@/server/events'

export const getEvents = query(async () => {
	const { locals } = getRequestEvent()
	const events = await getEventsForSession(locals.session)
	return events
})
