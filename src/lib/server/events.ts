import { db, schema } from '@/lib/server/db'
import { asc, eq, inArray } from 'drizzle-orm'
import { encodeSHA256 } from './crypto'

export async function getEvent(eventId: string) {
	return db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		with: {
			organizer: {
				with: { session: { columns: { name: true } } },
			},
			options: {
				with: { responses: { with: { session: { columns: { name: true } } } } },
				orderBy: [asc(schema.options.startsAt)],
			},
		},
	})
}

export async function getSessions(locals: Map<string, string>) {
	const sessionIds = await Promise.all(locals.values().map(encodeSHA256))

	return db.query.sessions.findMany({
		where: inArray(schema.sessions.token, sessionIds),
		with: { event: { with: { organizer: true } } },
		columns: { token: false },
	})
}
