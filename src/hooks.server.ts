import type { Handle } from '@sveltejs/kit'

import { env } from '$env/dynamic/private'

import { getRequestEvent } from '$app/server'

import { parseSessionCookies } from '@/server/session'
import * as v from '@/server/validation'

function checkBasicAuth() {
	if (env.BASIC_AUTH !== "1") return true
	const authorization = getRequestEvent().request.headers.get('authorization')
	if (!authorization || !authorization.startsWith('Basic ')) return false
	const credentials = Buffer.from(authorization.slice(6), 'base64').toString('utf8')
	return credentials === `${env.BASIC_AUTH_USERNAME}:${env.BASIC_AUTH_PASSWORD}`
}

const ThemeSchema = v.fallback(v.picklist(['light', 'dark', 'system']), 'system')

export const handle: Handle = async ({ event, resolve }) => {
	if (!checkBasicAuth())
		return new Response(env.BASIC_AUTH_MESSAGE, {
			headers: { 'WWW-Authenticate': 'Basic realm="prikkert"' },
			status: 401,
		})

	event.locals.session = parseSessionCookies()

	event.locals.theme = v.parse(ThemeSchema, event.cookies.get('theme'))

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%sveltekit.theme%', event.locals.theme),
	})
}
