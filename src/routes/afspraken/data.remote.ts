import { asc, inArray } from 'drizzle-orm'

import { query, getRequestEvent } from '$app/server'

import { validateSession } from '#lib/server/session/validation.ts'
import { toInstant } from '#lib/shared/event/utils.ts'
import { db, schema } from '#lib/server/db/index.ts'
import { Temporal } from '#lib/shared/temporal.ts'
import { omit } from '#lib/shared/utils.ts'

export const getEvents = query(async () => {
	const { locals } = getRequestEvent()

	const sessions = [...locals.session.respondent.values(), ...locals.session.organizer.values()]
	const validEventIds = await Promise.all(
		sessions.map(async (session) => ((await validateSession(session)) ? session.eventId : null)),
	)
	const eventIds = validEventIds.filter((id) => id !== null)

	const data = await db.query.events.findMany({
		where: inArray(schema.events.id, eventIds),
		columns: { id: true, title: true, createdAt: true },
		with: {
			options: {
				columns: { startsAt: true, endsAt: true },
				orderBy: [asc(schema.options.startsAt)],
			},
			respondents: {
				columns: {},
				with: { responses: { columns: { availability: true } } },
			},
		},
	})

	const events = data
		.map((event) => ({
			...omit(event, 'options', 'respondents'),
			firstDate: event.options.at(0)!.startsAt,
			lastDate: event.options
				.map((option) => option.endsAt ?? option.startsAt)
				.toSorted((a, b) => Temporal.Instant.compare(toInstant(a), toInstant(b)))
				.at(-1)!,
			numberOfResponses: event.respondents.filter((s) => s.responses.length > 0).length,
		}))
		.toSorted((a, b) => Temporal.PlainDateTime.compare(b.createdAt, a.createdAt))

	return events
})
