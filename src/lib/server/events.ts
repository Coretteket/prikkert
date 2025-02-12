import { db, schema } from '@/lib/server/db'
import { asc, eq, inArray } from 'drizzle-orm'
import { encodeSHA256 } from './crypto'

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

export async function getSessions(session: App.Locals['session']) {
	const sessionIds = await Promise.all(session.values().map(({ id }) => id))

	return db.query.sessions.findMany({
		where: inArray(schema.sessions.id, sessionIds),
		with: { event: { with: { organizer: true } } },
		columns: { token: false },
	})
}
