import { asc, eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

import { query, getRequestEvent } from '$app/server'

import { db, schema } from '@/server/db'
import * as v from '@/server/validation'

export const getEventSession = query(v.string(), async (eventId) => {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: { hideParticipants: false, createdAt: false, expiresAt: false },
		with: { options: { columns: { eventId: false }, orderBy: [asc(schema.options.startsAt)] } },
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const sessionId = getRequestEvent().locals.session.get(eventId)?.id

	if (!sessionId) return { event, session: undefined }

	const session = await db.query.sessions.findFirst({
		where: eq(schema.sessions.id, sessionId),
		columns: { id: true, name: true },
		with: { responses: true },
	})

	if (!session) return { event, session: undefined }

	return {
		event,
		session: {
			...session,
			responses: Object.fromEntries(
				session.responses.map((response) => [response.optionId, response]),
			),
		},
	}
})
