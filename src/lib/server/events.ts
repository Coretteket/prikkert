import { db, schema } from '@/lib/server/db'
import { asc, eq, inArray } from 'drizzle-orm'
import { encodeSHA256 } from './crypto'

export async function getEvent(eventId: string, token?: string) {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		with: {
			sessions: { columns: { id: true, name: true } },
			organizer: { with: { session: { columns: { token: true } } } },
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
		isOrganizer: encodedToken === event.organizer.session.token,
		organizer: event.organizer.name,
		participants: event.sessions,
	}
}

export async function getSessions(locals: Map<string, string>) {
	const sessionIds = await Promise.all(locals.values().map(encodeSHA256))

	return db.query.sessions.findMany({
		where: inArray(schema.sessions.token, sessionIds),
		with: { event: { with: { organizer: true } } },
		columns: { token: false },
	})
}
