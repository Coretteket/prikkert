import { error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { validateSession } from '#lib/server/session/validation.ts'
import { db, schema } from '#lib/server/db/index.ts'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, params.eventId),
		columns: { organizerToken: true, hideResponses: true, title: true },
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const isOrganizer = await validateSession(
		locals.session.organizer.get(params.eventId),
		event.organizerToken,
	)

	if (!isOrganizer && event.hideResponses) {
		redirect(303, `/afspraak/reageren/${params.eventId}`)
	}

	return { eventTitle: event.title }
}
