import { getRequestEvent, query } from '$app/server'
import { db, schema } from '@/lib/server/db'
import { error } from '@sveltejs/kit'
import { asc, eq } from 'drizzle-orm'
import * as v from '@/lib/server/validation'

export const getEvent = query(v.optional(v.string()), async (eventId) => {
	if (!eventId) throw error(404, 'Afspraak niet gevonden')

	const { locals } = getRequestEvent()

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: { hideParticipants: false, createdAt: false, expiresAt: false },
		with: { options: { columns: { eventId: false }, orderBy: [asc(schema.options.startsAt)] } },
	})

	if (!event) throw error(404, 'Afspraak niet gevonden')

	const sessionId = locals.session.get(eventId)?.id

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
			responses: new Map(session.responses.map((response) => [response.optionId, response])),
		},
	}
})
