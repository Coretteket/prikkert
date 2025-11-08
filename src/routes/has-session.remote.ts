import { getRequestEvent, query } from '$app/server'

export const hasSession = query(() => {
	const { locals } = getRequestEvent()
	return locals.session.size > 0
})
