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

const OrganizerSessionCookieSchema = v.object({
	name: OrganizerSessionKeySchema,
	value: OrganizerSessionValueSchema,
})

const RespondentSessionCookieSchema = v.object({
	name: RespondentSessionKeySchema,
	value: RespondentSessionValueSchema,
})

type SessionCookieOptions = {
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

export function setSessionCookie(options: SessionCookieOptions) {
	const { cookies, locals } = getRequestEvent()

	const key = (options.isOrganizer ? ORGANIZER_PREFIX : RESPONDENT_PREFIX) + options.eventId
	const value = options.isOrganizer ? options.token : options.respondentId + options.token

	v.assert(options.isOrganizer ? OrganizerSessionKeySchema : RespondentSessionKeySchema, key)
	v.assert(options.isOrganizer ? OrganizerSessionValueSchema : RespondentSessionValueSchema, value)

	cookies.set(key, value, { ...COOKIE_OPTIONS, expires: new Date(options.expires) })

	if (options.isOrganizer)
		locals.session.organizer.set(options.eventId, {
			eventId: options.eventId,
			token: options.token,
		})
	else
		locals.session.respondent.set(options.eventId, {
			eventId: options.eventId,
			respondentId: options.respondentId,
			token: options.token,
		})
}

export function deleteSessionCookie(options: { isOrganizer: boolean; eventId: string }) {
	const { cookies, locals } = getRequestEvent()

	const key = (options.isOrganizer ? ORGANIZER_PREFIX : RESPONDENT_PREFIX) + options.eventId

	cookies.delete(key, COOKIE_OPTIONS)

	locals.session[options.isOrganizer ? 'organizer' : 'respondent'].delete(options.eventId)
}

type Session<T extends boolean> = v.InferOutput<
	T extends true ? typeof OrganizerSessionValueSchema : typeof RespondentSessionValueSchema
> & { eventId: string }

export type OrganizerSession = Session<true>
export type RespondentSession = Session<false>

export function parseSessionCookies() {
	const { cookies } = getRequestEvent()

	const organizer = new Map<string, Session<true>>()
	const respondent = new Map<string, Session<false>>()

	for (const cookie of cookies.getAll()) {
		const organizerParse = v.safeParse(OrganizerSessionCookieSchema, cookie)
		if (organizerParse.success) {
			organizer.set(organizerParse.output.name, {
				eventId: organizerParse.output.name,
				...organizerParse.output.value,
			})
			continue
		}

		const respondentParse = v.safeParse(RespondentSessionCookieSchema, cookie)
		if (respondentParse.success) {
			respondent.set(respondentParse.output.name, {
				eventId: respondentParse.output.name,
				...respondentParse.output.value,
			})
		}
	}

	return { organizer, respondent }
}
