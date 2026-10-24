import { error, redirect } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'

import { form, getRequestEvent, query } from '$app/server'
import { PUBLIC_ORIGIN } from '$app/env/public'

import { requireOrganizerOrThrow, validateSession } from '#lib/server/session/validation.ts'
import { deleteSessionCookie, setSessionCookie } from '#lib/server/session/cookies.ts'
import { db, schema } from '#lib/server/db/index.ts'
import * as v from '#lib/server/validation.ts'

import { hasSession } from '../../../data.remote.ts'
import { getEventResponses } from './data.remote.ts'

export const removeEvent = form(v.object({ id: v.string() }), async ({ id: eventId }) => {
	await requireOrganizerOrThrow(eventId)

	await db.delete(schema.events).where(eq(schema.events.id, eventId))

	deleteSessionCookie({
		isOrganizer: true,
		eventId,
	})

	hasSession().refresh()

	redirect(303, '/afspraken')
})

export const selectDate = form(
	v.object({ id: v.string(), optionId: v.string() }),
	async ({ id: eventId, optionId }) => {
		await requireOrganizerOrThrow(eventId)

		await db
			.update(schema.options)
			.set({ isSelected: true })
			.where(and(eq(schema.options.id, optionId), eq(schema.options.eventId, eventId)))

		getEventResponses(eventId).refresh()
	},
)

export const unselectDate = form(v.object({ id: v.string() }), async ({ id: eventId }) => {
	await requireOrganizerOrThrow(eventId)

	await db
		.update(schema.options)
		.set({ isSelected: false })
		.where(eq(schema.options.eventId, eventId))

	getEventResponses(eventId).refresh()
})

export const getOrganizerShareLink = query(v.string(), async (eventId) => {
	const session = await requireOrganizerOrThrow(eventId)
	return `${PUBLIC_ORIGIN}/${eventId}#organisator=${session.token}`
})

export const validateOrganizerShareLink = form(
	v.object({ id: v.string(), token: v.string() }),
	async (session) => {
		const { locals } = getRequestEvent()

		const event = await db.query.events.findFirst({
			where: eq(schema.events.id, session.id),
			columns: { organizerToken: true, expiresAt: true },
		})

		if (!event) return error(404, 'Afspraak niet gevonden.')

		const isOrganizer = await validateSession(
			{ eventId: session.id, token: session.token },
			event.organizerToken,
		)

		if (!isOrganizer) return error(403, 'Ongeldige link.')

		locals.session.organizer.set(session.id, {
			eventId: session.id,
			token: session.token,
		})

		setSessionCookie({
			isOrganizer: true,
			eventId: session.id,
			token: session.token,
			expires: event.expiresAt,
		})

		getEventResponses(session.id).refresh()
		hasSession().set(true)

		return true
	},
)
