import type { Handle } from '@sveltejs/kit'
import { validateSession } from '@/lib/server/session'

export const handle: Handle = async ({ event, resolve }) => {
	event.locals = await validateSession({ cookies: event.cookies })
	return resolve(event)
}
