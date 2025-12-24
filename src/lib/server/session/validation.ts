import { and, eq } from 'drizzle-orm'

import type { OrganizerSession, RespondentSession } from './cookies'

import { encodeSHA256 } from '../crypto'
import { db, schema } from '../db'

export async function validateOrganizer(session?: OrganizerSession) {
	if (!session) return false

	const result = await db
		.select({ organizerToken: schema.events.organizerToken })
		.from(schema.events)
		.where(eq(schema.events.id, session.eventId))
		.limit(1)

	if (result.length === 0) return false

	return result[0].organizerToken === (await encodeSHA256(session.token))
}

export async function validateRespondent(session: RespondentSession) {
	if (!session) return false

	const result = await db
		.select({ token: schema.respondents.token })
		.from(schema.respondents)
		.where(
			and(
				eq(schema.respondents.id, session.respondentId),
				eq(schema.respondents.eventId, session.eventId),
			),
		)
		.limit(1)

	if (result.length === 0) return false

	return result[0].token === (await encodeSHA256(session.token))
}
