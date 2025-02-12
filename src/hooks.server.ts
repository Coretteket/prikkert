import type { Handle } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

export const handle: Handle = async ({ event, resolve }) => {
	const sessionData = new Map<string, { id: string; token: string }>()

	for (const cookie of event.cookies.getAll()) {
		if (cookie.name.startsWith(env.COOKIE_PREFIX)) {
			const key = cookie.name.slice(env.COOKIE_PREFIX.length)
			const [id, token] = cookie.value.split('/') as [string, string]
			sessionData.set(key, { id, token })
		}
	}

	event.locals.session = sessionData

	return resolve(event)
}
