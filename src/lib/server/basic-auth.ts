import { env } from '$env/dynamic/private'

import { getRequestEvent } from '$app/server'
import { building } from '$app/environment'

export function validateBasicAuth() {
	if (env.BASIC_AUTH !== '1' || building) return true
	const authorization = getRequestEvent().request.headers.get('authorization')
	if (!authorization || !authorization.startsWith('Basic ')) return false
	const credentials = Buffer.from(authorization.slice(6), 'base64').toString('utf8')
	return credentials === `${env.BASIC_AUTH_USERNAME}:${env.BASIC_AUTH_PASSWORD}`
}

export const unauthenticated = () =>
	new Response(env.BASIC_AUTH_MESSAGE, {
		headers: { 'WWW-Authenticate': 'Basic realm="prikkert"' },
		status: 401,
	})
