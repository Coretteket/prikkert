import { asc, eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

import { query, getRequestEvent } from '$app/server'

import { db, schema } from '@/server/db'
import * as v from '@/server/validation'
import { omit } from '@/shared/utils'

export const getEventForSession = query(v.string(), async (eventId) => {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: { hideParticipants: false, createdAt: false, expiresAt: false },
		with: {
			options: {
				columns: { eventId: false, isSelected: false },
				orderBy: [asc(schema.options.startsAt)],
			},
		},
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const sessionId = getRequestEvent().locals.session.get(eventId)?.id

	if (!sessionId)
		return {
			...event,
			responseName: undefined,
			options: event.options.map((option) => ({ ...option, response: undefined })),
		}

	const session = await db.query.sessions.findFirst({
		where: eq(schema.sessions.id, sessionId),
		columns: { id: true, name: true },
		with: { responses: { columns: { optionId: true, availability: true, note: true } } },
	})

	if (!session)
		return {
			...event,
			responseName: undefined,
			options: event.options.map((option) => ({ ...option, response: undefined })),
		}

	return {
		...event,
		responseName: session.name,
		options: event.options.map((option) => {
			const response = session.responses.find((response) => response.optionId === option.id)
			if (response) return { ...option, response: omit(response, 'optionId') }
			return { ...option, response: undefined }
		}),
	}
})
