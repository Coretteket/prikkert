import { loadLocales, runWithLocale } from 'wuchale/load-utils/server'
import { redirect, type Handle } from '@sveltejs/kit'

import { building, dev } from '$app/environment'

import { parseSessionCookies } from '@/server/session/cookies'
import { parseTheme, parseTimezone } from '@/server/cookies'
import { ID_LENGTH } from '@/server/db/schema'
import { getLocaleURL } from '@/shared/url'

import * as main from './locales/main.loader.server.svelte.js'
import * as js from './locales/js.loader.server.js'
import { locales } from './locales/data'
import { cron } from './cron.server'

export const init = () => !dev && !building && cron.start()

loadLocales(main.key, main.loadIDs, main.loadCatalog, locales)
loadLocales(js.key, js.loadIDs, js.loadCatalog, locales)

const NL_PUBLIC_PATHS = ['/', '/afspraak/aanmaken', '/privacy', '/voorwaarden', '/sitemap.xml']

export const PUBLIC_PATHS = NL_PUBLIC_PATHS.flatMap((p) => {
	const en = getLocaleURL(p, 'en')
	return en === '/en' || en.startsWith('/en/') ? [p, en] : [p]
})

export const handle: Handle = async ({ event, resolve }) => {
	const cookieLocale = event.cookies.get('locale') === 'en' ? 'en' : 'nl'

	if (event.url.pathname.length === ID_LENGTH + 1 && !event.url.pathname.slice(1).includes('/')) {
		redirect(303, getLocaleURL(`/afspraak/overzicht/${event.url.pathname.slice(1)}`, cookieLocale))
	}

	if (event.url.pathname === '/' && cookieLocale === 'en') {
		redirect(303, '/en')
	}

	event.locals.session = parseSessionCookies()
	event.locals.theme = parseTheme()
	event.locals.timezone = parseTimezone()
	event.locals.locale = event.url.pathname.startsWith('/en') ? 'en' : 'nl'

	const response = await runWithLocale(event.locals.locale, () =>
		resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%sveltekit.theme%', event.locals.theme)
					.replace('%sveltekit.lang%', event.locals.locale),
		}),
	)

	response.headers.set('Referrer-Policy', 'same-origin')

	response.headers.set(
		'X-Robots-Tag',
		PUBLIC_PATHS.includes(event.url.pathname) ? 'all' : 'noindex, nofollow',
	)

	return response
}
