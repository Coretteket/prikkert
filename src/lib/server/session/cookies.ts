import type { Cookies } from '@sveltejs/kit'

import { env } from '$env/dynamic/private'

import { getRequestEvent } from '$app/server'
import { dev } from '$app/environment'

import { ID_LENGTH, TOKEN_LENGTH } from '@/server/db/schema'
import * as v from '@/server/validation'

const RESPONDENT_PREFIX = `${env.COOKIE_PREFIX}_deelnemer_`
const ORGANIZER_PREFIX = `${env.COOKIE_PREFIX}_organisator_`

const RespondentSessionKeySchema = v.pipe(
	v.string(),
	v.startsWith(RESPONDENT_PREFIX),
	v.transform((key) => key.slice(RESPONDENT_PREFIX.length)),
	v.regex(new RegExp(`^[A-Za-z0-9]{${ID_LENGTH}}$`)),
)

const OrganizerSessionKeySchema = v.pipe(
	v.string(),
	v.startsWith(ORGANIZER_PREFIX),
	v.transform((key) => key.slice(ORGANIZER_PREFIX.length)),
	v.regex(new RegExp(`^[A-Za-z0-9]{${ID_LENGTH}}$`)),
)

const RespondentSessionValueSchema = v.pipe(
	v.string(),
	v.regex(new RegExp(`^[A-Za-z0-9]{${ID_LENGTH + TOKEN_LENGTH}}$`)),
	v.transform((value) => ({
		respondentId: value.slice(0, ID_LENGTH),
		token: value.slice(ID_LENGTH),
	})),
)

const OrganizerSessionValueSchema = v.pipe(
	v.string(),
	v.regex(new RegExp(`^[A-Za-z0-9]{${TOKEN_LENGTH}}$`)),
	v.transform((value) => ({ token: value })),
)

type SessionCookieOpts = {
	eventId: string
	expires: number | string | Date
	token: string
} & ({ isOrganizer: true } | { isOrganizer: false; respondentId: string })

const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
	secure: !dev,
} satisfies Parameters<Cookies['set']>[2]

export function setSessionCookie(opts: SessionCookieOpts) {
	const { cookies, locals } = getRequestEvent()

	const key = (opts.isOrganizer ? ORGANIZER_PREFIX : RESPONDENT_PREFIX) + opts.eventId
	const value = opts.isOrganizer ? opts.token : opts.respondentId + opts.token

	v.assert(opts.isOrganizer ? OrganizerSessionKeySchema : RespondentSessionKeySchema, key)
	v.assert(opts.isOrganizer ? OrganizerSessionValueSchema : RespondentSessionValueSchema, value)

	cookies.set(key, value, { ...COOKIE_OPTIONS, expires: new Date(opts.expires) })

	if (opts.isOrganizer)
		locals.session.organizer.set(opts.eventId, {
			eventId: opts.eventId,
			token: opts.token,
		})
	else
		locals.session.respondent.set(opts.eventId, {
			eventId: opts.eventId,
			respondentId: opts.respondentId,
			token: opts.token,
		})
}

export function deleteSessionCookie(opts: { isOrganizer: boolean; eventId: string }) {
	const { cookies, locals } = getRequestEvent()

	const key = (opts.isOrganizer ? ORGANIZER_PREFIX : RESPONDENT_PREFIX) + opts.eventId

	cookies.delete(key, COOKIE_OPTIONS)

	locals.session[opts.isOrganizer ? 'organizer' : 'respondent'].delete(opts.eventId)
}

type Session<T extends boolean> = v.InferOutput<
	T extends true ? typeof OrganizerSessionValueSchema : typeof RespondentSessionValueSchema
> & { eventId: string }

export type OrganizerSession = Session<true>
export type RespondentSession = Session<false>

export function parseSessionCookies<T extends boolean>(opts: { isOrganizer: T }) {
	const { cookies } = getRequestEvent()

	const sessionData = new Map<string, Session<T>>()

	for (const cookie of cookies.getAll()) {
		const validatedKey = v.safeParse(
			opts.isOrganizer ? OrganizerSessionKeySchema : RespondentSessionKeySchema,
			cookie.name,
		)

		if (!validatedKey.success) continue

		const validatedValue = v.safeParse(
			opts.isOrganizer ? OrganizerSessionValueSchema : RespondentSessionValueSchema,
			cookie.value,
		)

		if (!validatedValue.success) continue

		sessionData.set(validatedKey.output, {
			eventId: validatedKey.output,
			...validatedValue.output,
		})
	}

	return sessionData
}
