import { redirect } from '@sveltejs/kit'

import { form, getRequestEvent } from '$app/server'

import { buildEventOptions, getExpiryDate } from '#lib/shared/event/utils.ts'
import { encodeSHA256, generateNanoID } from '#lib/server/crypto.ts'
import { setSessionCookie } from '#lib/server/session/cookies.ts'
import { EventFormSchema } from '#lib/shared/event/schema.ts'
import { db, schema } from '#lib/server/db/index.ts'

import { hasSession } from '../../data.remote.ts'

export const createEvent = form(EventFormSchema, async (parsed) => {
	const { locals } = getRequestEvent()

	const token = generateNanoID(21)
	const hashedToken = await encodeSHA256(token)

	const [event] = await db.transaction(async (db) => {
		const options = buildEventOptions(parsed.options, locals.timezone)

		const expiresAt = getExpiryDate(options)

		const [event] = await db
			.insert(schema.events)
			.values({
				title: parsed.title,
				organizerToken: hashedToken,
				organizerName: parsed.organizerName,
				description: parsed.description,
				allowAnonymous: parsed.allowAnonymous,
				hideResponses: parsed.hideResponses,
				expiresAt,
			})
			.returning()

		await db
			.insert(schema.options)
			.values(options.map((option) => ({ ...option, eventId: event.id })))

		setSessionCookie({
			eventId: event.id,
			isOrganizer: true,
			token,
			expires: expiresAt,
		})

		return [event]
	})

	hasSession().set(true)

	redirect(303, `/afspraak/overzicht/${event.id}`)
})
