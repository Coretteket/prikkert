import type { Handle } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = new Map(
		event.cookies
			.getAll()
			.flatMap((cookie) =>
				cookie.name.startsWith(env.COOKIE_PREFIX)
					? [[cookie.name.slice(env.COOKIE_PREFIX.length), cookie.value]]
					: [],
			),
	)

	return resolve(event)
}
