import { asc, eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

import { query, getRequestEvent } from '$app/server'

import { validateSession } from '@/server/session/validation'
import { db, schema } from '@/server/db'
import * as v from '@/server/validation'
import { omit } from '@/shared/utils'

export const getEventForSession = query(v.string(), async (eventId) => {
	const { locals } = getRequestEvent()

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: { createdAt: false, expiresAt: false },
		with: {
			options: {
				columns: { eventId: false },
				orderBy: [asc(schema.options.startsAt)],
			},
		},
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const respondentId = locals.session.respondent.get(eventId)?.respondentId

	const respondent = respondentId
		? await db.query.respondents.findFirst({
				where: eq(schema.respondents.id, respondentId),
				columns: { id: true, name: true },
				with: { responses: { columns: { optionId: true, availability: true, note: true } } },
			})
		: null

	const hasResponded = Boolean(respondent)

	const isOrganizer = await validateSession(
		locals.session.organizer.get(eventId),
		event.organizerToken,
	)

	const selectedOption = event.options.find((option) => option.isSelected)

	return {
		...event,
		isOrganizer,
		selectedOption,
		hasResponded,
		responseName: respondent?.name ?? null,
		options: event.options.map((option) => {
			const response = respondent?.responses.find((response) => response.optionId === option.id)
			return { ...option, response: response ? omit(response, 'optionId') : null }
		}),
	}
})
