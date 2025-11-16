import type { Cookies } from '@sveltejs/kit'

import * as v from '@/lib/server/validation'
import { dev } from '$app/environment'
import { getRequestEvent } from '$app/server'
import { env } from '$env/dynamic/private'

const SessionKeySchema = v.pipe(
	v.string(),
	v.startsWith(env.COOKIE_PREFIX),
	v.transform((key) => key.slice(env.COOKIE_PREFIX.length)),
	v.regex(/^[A-Za-z0-9]{16}$/),
)

const SessionValueSchema = v.pipe(
	v.string(),
	v.regex(/^[A-Za-z0-9]{37}$/),
	v.transform((value) => ({ id: value.slice(0, 16), token: value.slice(16) })),
)

export function setSessionCookie({
	cookies,
	eventId,
	sessionId,
	expires,
	token,
}: {
	cookies: Cookies
	eventId: string
	sessionId: string
	expires: number | string | Date
	token: string
}) {
	const key = env.COOKIE_PREFIX + eventId
	const value = sessionId + token

	v.assert(SessionKeySchema, key)
	v.assert(SessionValueSchema, value)

	cookies.set(key, value, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		expires: new Date(expires),
	})
}

export function parseSessionCookies() {
	const { cookies } = getRequestEvent()

	const sessionData = new Map<
		v.InferOutput<typeof SessionKeySchema>,
		v.InferOutput<typeof SessionValueSchema>
	>()

	for (const cookie of cookies.getAll()) {
		const validatedKey = v.safeParse(SessionKeySchema, cookie.name)
		if (!validatedKey.success) continue
		const validatedValue = v.safeParse(SessionValueSchema, cookie.value)
		if (!validatedValue.success) continue
		sessionData.set(validatedKey.output, validatedValue.output)
	}

	return sessionData
}
