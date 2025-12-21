import { asc, eq, inArray } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

import { getRequestEvent, query } from '$app/server'

import { db, schema } from '@/server/db'
import * as v from '@/server/validation'
import { omit } from '@/shared/utils'

const order = { YES: 0, MAYBE: 1, NO: 2 }

export const getEventResponses = query(v.optional(v.string()), async (eventId) => {
	if (!eventId) error(404, 'Afspraak niet gevonden')

	const { locals } = getRequestEvent()

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: { id: true, title: true, description: true, organizerName: true },
		with: {
			options: {
				columns: { id: true, startsAt: true, endsAt: true },
				with: {
					responses: {
						columns: { availability: true, note: true },
						with: { session: { columns: { id: true, name: true } } },
					},
				},
				orderBy: [asc(schema.options.startsAt)],
			},
			sessions: {
				columns: { id: true, isOwner: true },
				where: inArray(schema.sessions.id, Array.from(locals.session.values().map((s) => s.id))),
			},
		},
	})
	if (!event) error(404, 'Afspraak niet gevonden')

	const numberOfResponses = new Set(
		event.options.flatMap((option) => option.responses.map((r) => r.session.id)),
	).size

	const hasResponded =
		locals.session.has(eventId) &&
		event.options.some((option) =>
			option.responses.some((response) => response.session.id === locals.session.get(eventId)!.id),
		)

	const isOwner = event.sessions.some((s) => s.isOwner) ?? false

	return {
		...omit(event, 'sessions'),
		numberOfResponses,
		hasResponded,
		isOwner,
		options: event.options.map((option) => ({
			...option,
			responses: option.responses
				.toSorted((a, b) => {
					const availability = order[a.availability] - order[b.availability]
					if (availability !== 0) return availability
					return (b.session.name ?? '').localeCompare(a.session.name ?? '')
				})
				.map((response) => ({
					availability: response.availability,
					note: response.note,
					name: response.session.name,
				})),
		})),
	}
})
