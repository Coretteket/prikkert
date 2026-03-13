import { loadLocales, runWithLocale } from 'wuchale/load-utils/server'
import { type Handle } from '@sveltejs/kit'
import { env } from '$env/dynamic/public'

import { building, dev } from '$app/environment'

import { parseSessionCookies } from '@/server/session/cookies'
import { parseTheme, parseTimezone } from '@/server/cookies'
import { getLocaleURL, PUBLIC_PATHS } from '@/shared/url'
import { ID_LENGTH } from '@/server/db/schema'

import * as main from './locales/main.loader.server.svelte.js'
import * as js from './locales/js.loader.server.js'
import { locales } from './locales/data'
import { cron } from './cron.server'

export const init = () => !dev && !building && cron.start()

loadLocales(main.key, main.loadIDs, main.loadCatalog, locales)
loadLocales(js.key, js.loadIDs, js.loadCatalog, locales)

const redirect = (location: string) =>
	new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store' } })

export const handle: Handle = async ({ event, resolve }) => {
	const cookieLocale = event.cookies.get('locale') ?? ''
	const acceptLanguage = event.request.headers.get('accept-language') ?? ''

	const locale = locales.includes(cookieLocale)
		? (cookieLocale as 'nl' | 'en')
		: acceptLanguage?.includes('nl')
			? 'nl'
			: 'en'

	if (event.url.pathname.length === ID_LENGTH + 1 && !event.url.pathname.slice(1).includes('/')) {
		return redirect(getLocaleURL(`/afspraak/overzicht/${event.url.pathname.slice(1)}`, locale))
	}

	const localeURL = getLocaleURL(event.url.pathname, locale)
	if (cookieLocale !== '' && localeURL !== event.url.pathname) {
		return redirect(localeURL + event.url.search)
	}

	event.locals.session = parseSessionCookies()
	event.locals.theme = parseTheme()
	event.locals.timezone = parseTimezone()
	event.locals.locale = locale

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
		env.PUBLIC_NO_INDEX === '1' || !PUBLIC_PATHS.includes(event.url.pathname)
			? 'noindex, nofollow'
			: 'all',
	)

	return response
}
