import { error, redirect } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'

import { form, getRequestEvent, query } from '$app/server'

import { deleteSessionCookie, setSessionCookie } from '@/server/session/cookies'
import { validateSession } from '@/server/session/validation'
import * as v from '@/server/validation'
import { db, schema } from '@/server/db'

import { getEventResponses } from './data.remote'
import { hasSession } from '../../../data.remote'

export const removeEvent = form(v.object({ id: v.string() }), async ({ id: eventId }) => {
	const { locals } = getRequestEvent()

	const session = locals.session.organizer.get(eventId)
	if (!session) error(403, 'Niet toegestaan.')

	const isOrganizer = await validateSession(session)
	if (!isOrganizer) error(403, 'Niet toegestaan.')

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
		const { locals } = getRequestEvent()

		const session = locals.session.organizer.get(eventId)
		if (!session) error(403, 'Niet toegestaan.')

		const isOrganizer = await validateSession(session)
		if (!isOrganizer) error(403, 'Niet toegestaan.')

		await db
			.update(schema.options)
			.set({ isSelected: true })
			.where(and(eq(schema.options.id, optionId), eq(schema.options.eventId, eventId)))

		getEventResponses(eventId).refresh()
	},
)

export const unselectDate = form(v.object({ id: v.string() }), async ({ id: eventId }) => {
	const { locals } = getRequestEvent()

	const session = locals.session.organizer.get(eventId)
	if (!session) error(403, 'Niet toegestaan.')

	const isOrganizer = await validateSession(session)
	if (!isOrganizer) error(403, 'Niet toegestaan.')

	await db
		.update(schema.options)
		.set({ isSelected: false })
		.where(eq(schema.options.eventId, eventId))

	getEventResponses(eventId).refresh()
})

export const getOrganizerShareLink = query(v.string(), async (eventId) => {
	const { locals } = getRequestEvent()

	const session = locals.session.organizer.get(eventId)
	if (!session) error(403, 'Niet toegestaan.')

	const isOrganizer = await validateSession(session)
	if (!isOrganizer) error(403, 'Niet toegestaan.')

	const link = `${getRequestEvent().url.origin}/afspraak/overzicht/${eventId}#organisator=${session.token}`

	return link
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
