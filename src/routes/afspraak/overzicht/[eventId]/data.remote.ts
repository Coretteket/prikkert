import { asc, eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

import { query } from '$app/server'

import { db, schema } from '@/server/db'
import * as v from '@/server/validation'

const order = { YES: 0, MAYBE: 1, NO: 2 }

export const getEventResponses = query(v.optional(v.string()), async (eventId) => {
	if (!eventId) error(404, 'Afspraak niet gevonden')

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: { id: true, title: true, description: true },
		with: {
			options: {
				columns: { id: true, startsAt: true, endsAt: true },
				with: {
					responses: {
						columns: { availability: true, note: true },
						with: { session: { columns: { name: true } } },
					},
				},
				orderBy: [asc(schema.options.startsAt)],
			},
		},
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	return {
		...event,
		options: event.options.map((option) => ({
			...option,
			responses: option.responses.toSorted((a, b) => {
				const availability = order[a.availability] - order[b.availability]
				if (availability !== 0) return availability
				return (b.session.name ?? '').localeCompare(a.session.name ?? '')
			}),
		})),
	}
})
