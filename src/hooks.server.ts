import { redirect, type Handle } from '@sveltejs/kit'

import { building, dev } from '$app/environment'

import { parseSessionCookies } from '@/server/session/cookies'
import { ID_LENGTH } from '@/server/db/schema'
import { parseTheme } from '@/server/theme'

import { cron } from './cron.server'

export const init = () => !dev && !building && cron.start()

export const PUBLIC_PATHS = ['/', '/afspraak/aanmaken', '/privacy', '/voorwaarden']

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname.slice(1)
	if (path.length === ID_LENGTH && !path.includes('/')) {
		redirect(303, `/afspraak/overzicht/${path}`)
	}

	event.locals.session = parseSessionCookies()
	event.locals.theme = parseTheme()

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%sveltekit.theme%', event.locals.theme),
	})

	response.headers.set('Referrer-Policy', 'same-origin')

	response.headers.set(
		'X-Robots-Tag',
		PUBLIC_PATHS.includes(event.url.pathname) ? 'all' : 'noindex, nofollow',
	)

	return response
}
