import { redirect } from '@sveltejs/kit'

import { form } from '$app/server'

import { getExpiryDate, getOptionKey } from '@/shared/event/utils'
import { encodeSHA256, generateNanoID } from '@/server/crypto'
import { setSessionCookie } from '@/server/session/cookies'
import { EventFormSchema } from '@/shared/event/schema'
import { deduplicate } from '@/shared/utils'
import { db, schema } from '@/server/db'

export const createEvent = form(EventFormSchema, async (parsed) => {
	const token = generateNanoID(21)
	const hashedToken = await encodeSHA256(token)

	const [event] = await db.transaction(async (db) => {
		const options = deduplicate(
			parsed.options.flatMap(([date, { slots }]) =>
				slots.map((slot) => ({
					startsAt: slot.startsAt ? date.toPlainDateTime(slot.startsAt) : date,
					endsAt: slot.endsAt ? date.toPlainDateTime(slot.endsAt) : null,
					note: slot.note || null,
				})),
			),
			getOptionKey,
		)

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

	redirect(303, `/afspraak/overzicht/${event.id}`)
})
