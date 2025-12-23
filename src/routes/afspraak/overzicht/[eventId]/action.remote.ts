import { error, redirect } from '@sveltejs/kit'
import { eq, and } from 'drizzle-orm'

import { form, getRequestEvent } from '$app/server'

import * as v from '@/server/validation'
import { db, schema } from '@/server/db'

const checkOwnership = async (eventId: string, sessionId: string) => {
	const result = await db
		.select({ isOwner: schema.sessions.isOwner })
		.from(schema.sessions)
		.where(and(eq(schema.sessions.eventId, eventId), eq(schema.sessions.id, sessionId)))
		.limit(1)

	return result.length > 0 && result[0].isOwner
}

export const removeEvent = form(v.object({ id: v.string() }), async ({ id: eventId }) => {
	const { locals } = getRequestEvent()

	const session = locals.session.get(eventId)
	if (!session) error(403, 'Niet toegestaan.')

	const isOwner = await checkOwnership(eventId, session.id)
	if (!isOwner) error(403, 'Niet toegestaan.')

	await db.delete(schema.events).where(eq(schema.events.id, eventId))

	redirect(303, '/afspraken')
})
