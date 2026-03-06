import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { db, schema } from '@/server/db'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, params.eventId),
		columns: { title: true },
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	return { eventTitle: event.title }
}
