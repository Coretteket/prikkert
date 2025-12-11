import type { Cookies } from '@sveltejs/kit'

import { env } from '$env/dynamic/private'

import { getRequestEvent } from '$app/server'
import { dev } from '$app/environment'

import { ID_LENGTH, TOKEN_LENGTH } from '@/server/db/schema'
import * as v from '@/server/validation'

const SessionKeySchema = v.pipe(
	v.string(),
	v.startsWith(env.COOKIE_PREFIX),
	v.transform((key) => key.slice(env.COOKIE_PREFIX.length)),
	v.regex(new RegExp(`^[A-Za-z0-9]{${ID_LENGTH}}$`)),
)

const SessionValueSchema = v.pipe(
	v.string(),
	v.regex(new RegExp(`^[A-Za-z0-9]{${ID_LENGTH + TOKEN_LENGTH}}$`)),
	v.transform((value) => ({ id: value.slice(0, ID_LENGTH), token: value.slice(ID_LENGTH) })),
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
