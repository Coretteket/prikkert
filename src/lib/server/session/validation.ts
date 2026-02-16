import { and, eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit'
import crypto from 'node:crypto'

import { getRequestEvent } from '$app/server'

import type { OrganizerSession, RespondentSession } from './cookies'

import { encodeSHA256 } from '../crypto'
import { db, schema } from '../db'

const getOrganizerToken = async (session: OrganizerSession) => {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, session.eventId),
		columns: { organizerToken: true },
	})
	return event?.organizerToken
}

const getRespondentToken = async (session: RespondentSession) => {
	const respondent = await db.query.respondents.findFirst({
		where: and(
			eq(schema.respondents.id, session.respondentId),
			eq(schema.respondents.eventId, session.eventId),
		),
		columns: { token: true },
	})
	return respondent?.token
}

export function timingSafeEqual(a: string, b: string | undefined) {
	try {
		return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b ?? ''))
	} catch {
		return false
	}
}

export async function validateSession(
	session?: OrganizerSession | RespondentSession,
	hashedToken?: string,
) {
	if (!session) return false

	const checkToken =
		hashedToken ??
		(await ('respondentId' in session ? getRespondentToken(session) : getOrganizerToken(session)))

	return timingSafeEqual(await encodeSHA256(session.token), checkToken)
}

export async function requireOrganizerOrThrow(eventId: string) {
	const { locals } = getRequestEvent()

	const session = locals.session.organizer.get(eventId)
	if (!session) error(403, 'Niet toegestaan.')

	const isOrganizer = await validateSession(session)
	if (!isOrganizer) error(403, 'Niet toegestaan.')

	return session
}
