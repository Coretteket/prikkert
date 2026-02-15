import { asc, eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

import { getRequestEvent, query } from '$app/server'

import { validateSession } from '@/server/session/validation'
import { db, schema } from '@/server/db'
import * as v from '@/server/validation'
import { omit } from '@/shared/utils'

const order = { YES: 0, MAYBE: 1, NO: 2 }

export const getEventResponses = query(v.optional(v.string()), async (eventId) => {
	if (!eventId) error(404, 'Afspraak niet gevonden')

	const { locals } = getRequestEvent()

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: {
			id: true,
			title: true,
			description: true,
			organizerName: true,
			organizerToken: true,
			hideResponses: true,
		},
		with: {
			options: {
				columns: { eventId: false },
				orderBy: [asc(schema.options.startsAt)],
				with: {
					responses: {
						columns: { availability: true, note: true },
						with: { respondent: { columns: { id: true, name: true } } },
					},
				},
			},
		},
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const isOrganizer = await validateSession(
		locals.session.organizer.get(eventId),
		event.organizerToken,
	)

	const selectedOption = event.options.find((option) => option.isSelected)

	const hasResponded = locals.session.respondent.has(eventId)

	const numberOfResponses = new Set(
		event.options.flatMap((option) => option.responses.map((r) => r.respondent.id)),
	).size

	const shouldHideResponses = event.hideResponses && !isOrganizer

	return {
		...omit(event, 'organizerToken'),
		selectedOption,
		hasResponded,
		numberOfResponses,
		isOrganizer,
		options: event.options.map((option) => ({
			...option,
			responses: (shouldHideResponses ? [] : option.responses)
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
