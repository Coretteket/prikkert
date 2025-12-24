import { error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { validateSession } from '@/server/session/validation'
import { db, schema } from '@/server/db'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, params.eventId),
		columns: { organizerToken: true, hideResponses: true },
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const isOrganizer = await validateSession(
		locals.session.organizer.get(params.eventId),
		event.organizerToken,
	)

	if (event.hideResponses && !isOrganizer) {
		redirect(303, `/afspraak/reageren/${params.eventId}`)
	}
}
