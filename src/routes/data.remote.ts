import { getRequestEvent, query } from '$app/server'

export const hasSession = query(() => {
	const session = getRequestEvent().locals.session
	return session.organizer.size > 0 || session.respondent.size > 0
})
