import { getRequestEvent, query } from '$app/server'

export const hasSession = query(() => {
	return getRequestEvent().locals.session.size > 0
})
