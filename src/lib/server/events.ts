import { db, schema } from '@/lib/server/db'
import { eq } from 'drizzle-orm'

export async function getEvent(eventId: string) {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		with: { options: { with: { responses: true } } },
	})

	return event
}

export async function getEventsByUser(ownerId: string) {
	const events = await db.query.events.findMany({
		// should be queried by all events a user participates in
		where: eq(schema.events.ownerId, ownerId),
		with: { options: { with: { responses: true } } },
	})

	return events
}
