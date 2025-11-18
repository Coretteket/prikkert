import { asc, eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

import { query } from '$app/server'

import { db, schema } from '@/server/db'
import * as v from '@/server/validation'

export const getEventOverview = query(v.optional(v.string()), async (eventId) => {
	if (!eventId) error(404, 'Afspraak niet gevonden')

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: { hideParticipants: false, createdAt: false, expiresAt: false },
		with: {
			options: {
				columns: { eventId: false },
				with: { responses: { with: { session: { columns: { name: true } } } } },
				orderBy: [asc(schema.options.startsAt)],
			},
		},
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	return event
})
