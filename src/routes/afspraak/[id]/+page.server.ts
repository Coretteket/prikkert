import { db, schema } from '@/lib/server/db'
import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

export async function load({ params: { id } }) {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, id),
		with: { options: { with: { responses: true } } },
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	return { event }
}
