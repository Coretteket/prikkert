import { db, schema } from '@/lib/server/db'
import { asc, eq } from 'drizzle-orm'

export async function getEvent(eventId: string) {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		with: {
			owner: true,
			options: {
				with: { responses: true },
				orderBy: [asc(schema.eventOptions.startsAt)],
			},
		},
	})

	return event
}

export async function getEventsByUser(ownerId: string) {
	const events = await db.query.events.findMany({
		// should be queried by all events a user participates in
		where: eq(schema.events.ownerId, ownerId),
		with: {
			options: {
				with: { responses: true },
				orderBy: [asc(schema.eventOptions.startsAt)],
			},
		},
	})

	return events
}
