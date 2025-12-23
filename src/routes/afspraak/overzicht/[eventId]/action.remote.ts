import { error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { form, getRequestEvent } from '$app/server'

import { validateOrganizer } from '@/server/session/validation'
import * as v from '@/server/validation'
import { db, schema } from '@/server/db'

export const removeEvent = form(v.object({ id: v.string() }), async ({ id: eventId }) => {
	const { locals } = getRequestEvent()

	const session = locals.session.organizer.get(eventId)
	if (!session) error(403, 'Niet toegestaan.')

	const isOrganizer = await validateOrganizer(eventId, session)
	if (!isOrganizer) error(403, 'Niet toegestaan.')

	await db.delete(schema.events).where(eq(schema.events.id, eventId))

	redirect(303, '/afspraken')
})
