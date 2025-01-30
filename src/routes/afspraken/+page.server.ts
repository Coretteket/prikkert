import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/server/db'
import { redirect } from '@sveltejs/kit'

export async function load({ locals }) {
	if (!locals.session) throw redirect(307, '/inloggen')

	const events = await db.query.events.findMany({
		where: eq(schema.events.ownerId, locals.session.userId),
		with: { options: { with: { responses: true } } },
	})

	return { events }
}
