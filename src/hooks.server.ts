import type { Handle } from '@sveltejs/kit'
import { COOKIE_PREFIX } from '$env/static/private'

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = new Map(
		event.cookies
			.getAll()
			.flatMap((cookie) =>
				cookie.name.startsWith(COOKIE_PREFIX)
					? [[cookie.name.slice(COOKIE_PREFIX.length), cookie.value]]
					: [],
			),
	)

	return resolve(event)
}
