import { asc, inArray } from 'drizzle-orm'

import { query, getRequestEvent } from '$app/server'

import { Temporal } from '@/shared/temporal'
import { db, schema } from '@/server/db'
import { omit } from '@/shared/utils'

export const getEvents = query(async () => {
	const { locals } = getRequestEvent()

	const eventIds = [...locals.session.respondent.keys(), ...locals.session.organizer.keys()]

	const data = await db.query.events.findMany({
		where: inArray(schema.events.id, eventIds),
		columns: { id: true, title: true, createdAt: true },
		with: {
			options: {
				columns: { startsAt: true },
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
			lastDate: event.options.at(-1)!.startsAt,
			numberOfResponses: event.respondents.filter((s) => s.responses.length > 0).length,
		}))
		.toSorted((a, b) => Temporal.PlainDateTime.compare(b.createdAt, a.createdAt))

	return events
})
