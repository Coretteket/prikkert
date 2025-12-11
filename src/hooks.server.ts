import { redirect, type Handle } from '@sveltejs/kit'

import { dev } from '$app/environment'

import { unauthenticated, validateBasicAuth } from '@/server/basic-auth'
import { parseSessionCookies } from '@/server/session'
import { ID_LENGTH } from '@/server/db/schema'
import * as v from '@/server/validation'

const ThemeSchema = v.fallback(v.picklist(['light', 'dark', 'system']), 'system')

export const handle: Handle = async ({ event, resolve }) => {
	if (!validateBasicAuth()) return unauthenticated()

	const path = event.url.pathname.slice(1)
	if (path.length === ID_LENGTH && !path.includes('/'))
		redirect(dev ? 307 : 308, `/afspraak/reageren/` + path)

	event.locals.session = parseSessionCookies()

	event.locals.theme = v.parse(ThemeSchema, event.cookies.get('theme'))

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%sveltekit.theme%', event.locals.theme),
	})
}
