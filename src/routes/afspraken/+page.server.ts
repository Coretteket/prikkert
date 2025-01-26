import { eq } from 'drizzle-orm'
import { db, schema } from '@/db'
import { redirect } from '@sveltejs/kit'

export async function load({ locals }) {
	if (!locals.user) throw redirect(307, '/inloggen')

	const events = await db.query.events.findMany({
		where: eq(schema.events.ownerId, locals.user.id),
		with: { options: { with: { responses: true } } },
	})

	return { events }
}
