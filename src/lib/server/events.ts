import { db, schema } from '@/lib/server/db'
import { eq, sql } from 'drizzle-orm'

const EVENT_PLACEHOLDER = 'eventId' as const

const eventQuery = db.query.events
	.findFirst({
		where: eq(schema.events.id, sql.placeholder(EVENT_PLACEHOLDER)),
		with: { options: { with: { responses: true } } },
	})
	.prepare('event')

export async function getEvent(eventId: string) {
	const event = await eventQuery.execute({ [EVENT_PLACEHOLDER]: eventId })
	return event
}
