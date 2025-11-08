import { getRequestEvent, query } from '$app/server'
import { getSessions } from '@/lib/server/events'

export const getEvents = query(async () => {
	const { locals } = getRequestEvent()
	const sessions = await getSessions(locals.session)
	return { sessions }
})
