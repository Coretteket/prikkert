import { redirect, type Handle } from '@sveltejs/kit'

import { building, dev } from '$app/environment'

import { unauthenticated, validateBasicAuth } from '@/server/basic-auth'
import { parseSessionCookies } from '@/server/session/cookies'
import { ID_LENGTH } from '@/server/db/schema'
import { parseTheme } from '@/server/theme'

import { cron } from './cron.server'

export const init = () => !dev && !building && cron.start()

export const handle: Handle = async ({ event, resolve }) => {
	if (!validateBasicAuth()) return unauthenticated()

	const path = event.url.pathname.slice(1)
	if (path.length === ID_LENGTH && !path.includes('/'))
		redirect(dev ? 307 : 308, `/afspraak/reageren/` + path)

	event.locals.session = parseSessionCookies()
	event.locals.theme = parseTheme()

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%sveltekit.theme%', event.locals.theme),
	})

	response.headers.set('Referrer-Policy', 'same-origin')

	return response
}
