import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { query } from '$app/server'

import { requireOrganizerOrThrow } from '@/server/session/validation'
import { emptySlot, type PartialSlot } from '@/shared/event-types'
import { Temporal } from '@/shared/temporal'
import { db, schema } from '@/server/db'
import * as v from '@/server/validation'

export const getEditEvent = query(v.string(), async (eventId) => {
	await requireOrganizerOrThrow(eventId)

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		with: { options: { with: { responses: true } } },
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const options = new Map<string, Array<PartialSlot>>()

	for (const option of event.options) {
		const date = Temporal.PlainDate.from(option.startsAt).toString()

		if (
			option.startsAt instanceof Temporal.PlainDateTime &&
			option.endsAt instanceof Temporal.PlainDateTime
		) {
			const startsAt = Temporal.PlainTime.from(option.startsAt)
			const endsAt = Temporal.PlainTime.from(option.endsAt)
			if (options.has(date)) options.get(date)!.push([startsAt, endsAt])
			else options.set(date, [[startsAt, endsAt]])
		} else if (option.startsAt instanceof Temporal.PlainDateTime) {
			const startsAt = Temporal.PlainTime.from(option.startsAt)
			if (options.has(date)) options.get(date)!.push([startsAt])
			else options.set(date, [[startsAt]])
		} else {
			options.set(date, [emptySlot])
		}
	}

	return {
		event,
		hasResponses: event.options.some((o) => o.responses.length > 0),
		initialValues: {
			id: event.id,
			title: event.title,
			description: event.description ?? '',
			organizerName: event.organizerName ?? undefined,
			allowAnonymous: event.allowAnonymous,
			hideResponses: event.hideResponses,
			options,
		},
	}
})
