import type { Handle } from '@sveltejs/kit'

import { unauthenticated, validateBasicAuth } from '@/server/basic-auth'
import { parseSessionCookies } from '@/server/session'
import * as v from '@/server/validation'

const ThemeSchema = v.fallback(v.picklist(['light', 'dark', 'system']), 'system')

export const handle: Handle = async ({ event, resolve }) => {
	if (!validateBasicAuth()) return unauthenticated()

	event.locals.session = parseSessionCookies()

	event.locals.theme = v.parse(ThemeSchema, event.cookies.get('theme'))

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%sveltekit.theme%', event.locals.theme),
	})
}
