import { and, eq } from 'drizzle-orm'

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

export async function validateSession(
	session?: OrganizerSession | RespondentSession,
	hashedToken?: string,
) {
	if (!session) return false

	const checkToken =
		hashedToken ??
		(await ('respondentId' in session ? getRespondentToken(session) : getOrganizerToken(session)))

	return checkToken === (await encodeSHA256(session.token))
}
