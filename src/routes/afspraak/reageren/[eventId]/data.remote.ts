import { and, asc, eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

import { query, getRequestEvent } from '$app/server'

import { validateSession } from '#lib/server/session/validation.ts'
import { db, schema } from '#lib/server/db/index.ts'
import * as v from '#lib/server/validation.ts'
import { omit } from '#lib/shared/utils.ts'

export const getEventForSession = query(v.string(), async (eventId) => {
	const { locals } = getRequestEvent()

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: {
			id: true,
			title: true,
			description: true,
			organizerName: true,
			organizerToken: true,
			allowAnonymous: true,
			hideResponses: true,
		},
		with: {
			options: {
				columns: { id: true, startsAt: true, endsAt: true, note: true, isSelected: true },
				orderBy: [asc(schema.options.startsAt)],
			},
		},
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const respondentSession = locals.session.respondent.get(eventId)
	const isRespondent = await validateSession(respondentSession)

	const respondent =
		isRespondent && respondentSession
			? await db.query.respondents.findFirst({
					where: and(
						eq(schema.respondents.id, respondentSession.respondentId),
						eq(schema.respondents.eventId, eventId),
					),
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
		id: event.id,
		title: event.title,
		description: event.description,
		organizerName: event.organizerName,
		allowAnonymous: event.allowAnonymous,
		hideResponses: event.hideResponses,
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
