import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { query } from '$app/server'

import { requireOrganizerOrThrow } from '@/server/session/validation'
import { type OptionEntry } from '@/shared/event/types'
import { getEventTimezone } from '@/shared/event/utils'
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

	const timezone = getEventTimezone(event.options)

	const options = new Map<string, OptionEntry>()

	for (const { startsAt, endsAt, note } of event.options) {
		const isZoned = startsAt instanceof Temporal.ZonedDateTime
		const date = isZoned ? startsAt.toPlainDate().toString() : startsAt.toString()

		const entry = options.get(date) ?? { hasTime: isZoned, slots: [] }

		entry.slots.push({
			note: note || undefined,
			startsAt: isZoned ? startsAt.toPlainTime() : undefined,
			endsAt: endsAt instanceof Temporal.ZonedDateTime ? endsAt.toPlainTime() : undefined,
		})

		options.set(date, entry)
	}

	return {
		event,
		hasResponses: event.options.some((o) => o.responses.length > 0),
		timezone,
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
