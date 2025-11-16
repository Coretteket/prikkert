import { db, schema } from '@/lib/server/db'
import { asc, desc, eq, inArray } from 'drizzle-orm'
import { encodeSHA256 } from './crypto'
import { omit } from '../utils'
import { PlainDateTime } from '../temporal'

export async function getEvent(eventId: string, token?: string) {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		with: {
			sessions: { columns: { id: true, name: true } },
			organizer: { with: { session: { columns: { name: true, token: true } } } },
			options: {
				orderBy: [asc(schema.options.startsAt)],
				with: { responses: { with: { session: { columns: { name: true } } } } },
			},
		},
	})

	if (!event) return null

	const encodedToken = await encodeSHA256(token)

	const options = event.options.map((option) => ({
		...option,
		responses: option.responses.map(({ session, ...response }) => ({
			...response,
			name: session.name,
		})),
	}))

	return {
		...event,
		options,
		participants: event.sessions,
		organizer: event.organizer.session.name,
		isOrganizer: encodedToken === event.organizer.session.token,
	}
}

export async function getEventsForSession(session: App.Locals['session']) {
	const sessionIds = await Promise.all(session.values().map(({ id }) => id))

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

	return data
		.map(({ event }) => ({
			...omit(event, 'options', 'sessions'),
			firstDate: event.options.at(0)!.startsAt,
			lastDate: event.options.at(-1)!.startsAt,
			numberOfResponses: event.sessions.filter((s) => s.responses.length > 0).length,
		}))
		.toSorted((a, b) => PlainDateTime.compare(b.createdAt, a.createdAt))
}
