import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

export async function load({ params: { id } }) {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, id),
		with: { options: { with: { responses: true } } },
	})

	return { event }
}
