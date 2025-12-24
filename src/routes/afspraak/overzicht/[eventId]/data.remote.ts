import { asc, eq, inArray } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

import { getRequestEvent, query } from '$app/server'

import { validateOrganizer } from '@/server/session/validation'
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
						with: { respondent: { columns: { id: true, name: true } } },
					},
				},
				orderBy: [asc(schema.options.startsAt)],
			},
			respondents: {
				columns: { id: true },
				where: inArray(
					schema.respondents.id,
					Array.from(locals.session.respondent.values().map((s) => s.respondentId)),
				),
			},
		},
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const isOrganizer = await validateOrganizer(locals.session.organizer.get(eventId))

	const hasResponded = locals.session.respondent.has(eventId)

	const numberOfResponses = new Set(
		event.options.flatMap((option) => option.responses.map((r) => r.respondent.id)),
	).size

	return {
		...omit(event, 'respondents'),
		numberOfResponses,
		hasResponded,
		isOrganizer,
		options: event.options.map((option) => ({
			...option,
			responses: option.responses
				.toSorted((a, b) => {
					const availability = order[a.availability] - order[b.availability]
					if (availability !== 0) return availability
					return (b.respondent.name ?? '').localeCompare(a.respondent.name ?? '')
				})
				.map((response) => ({
					availability: response.availability,
					note: response.note,
					name: response.respondent.name,
				})),
		})),
	}
})
