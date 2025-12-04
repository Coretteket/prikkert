import { asc, inArray } from 'drizzle-orm'

import { query, getRequestEvent } from '$app/server'

import { PlainDateTime } from '@/shared/temporal'
import { db, schema } from '@/server/db'
import { omit } from '@/shared/utils'

export const getEvents = query(async () => {
	const { locals } = getRequestEvent()
	const sessionIds = await Promise.all(locals.session.values().map(({ id }) => id))

	const data = await db.query.sessions.findMany({
		where: inArray(schema.sessions.id, sessionIds),
		columns: {},
		with: {
			event: {
				columns: { id: true, title: true, createdAt: true },
				with: {
					sessions: { columns: {}, with: { responses: { columns: { optionId: true } } } },
					options: { columns: { startsAt: true }, orderBy: [asc(schema.options.startsAt)] },
				},
			},
		},
	})

	const events = data
		.map(({ event }) => ({
			...omit(event, 'options', 'sessions'),
			firstDate: event.options.at(0)!.startsAt,
			lastDate: event.options.at(-1)!.startsAt,
			numberOfResponses: event.sessions.filter((s) => s.responses.length > 0).length,
		}))
		.toSorted((a, b) => PlainDateTime.compare(b.createdAt, a.createdAt))

	return events
})
