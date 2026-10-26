import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { query } from '$app/server'

import { requireOrganizerOrThrow } from '#lib/server/session/validation.ts'
import { type OptionEntry } from '#lib/shared/event/types.ts'
import { getEventTimezone } from '#lib/shared/event/utils.ts'
import { db, schema } from '#lib/server/db/index.ts'
import { Temporal } from '#lib/shared/temporal.ts'
import * as v from '#lib/server/validation.ts'

export const getEditEvent = query(v.string(), async (eventId) => {
	await requireOrganizerOrThrow(eventId)

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: {
			id: true,
			title: true,
			description: true,
			organizerName: true,
			allowAnonymous: true,
			hideResponses: true,
		},
		with: {
			options: {
				columns: { startsAt: true, endsAt: true, note: true },
				with: { responses: { columns: { optionId: true } } },
			},
		},
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const timezone = getEventTimezone(event.options)

	const options = new Map<string, OptionEntry>()

	for (const { startsAt, endsAt, note } of event.options) {
		const isZoned = startsAt instanceof Temporal.ZonedDateTime
		const date = isZoned ? startsAt.toPlainDate().toString() : startsAt.toString()
		const startDate = isZoned ? startsAt.toPlainDate() : startsAt
		const endDate =
			endsAt instanceof Temporal.ZonedDateTime ? endsAt.toPlainDate() : (endsAt ?? undefined)

		const entry = options.get(date) ?? { hasTime: isZoned, slots: [] }
		if (
			endDate &&
			entry.endDate === undefined &&
			Temporal.PlainDate.compare(startDate, endDate) !== 0
		)
			entry.endDate = endDate.toString()

		entry.slots.push({
			note: note || undefined,
			startsAt: isZoned ? startsAt.toPlainTime() : undefined,
			endsAt: endsAt instanceof Temporal.ZonedDateTime ? endsAt.toPlainTime() : undefined,
		})

		options.set(date, entry)
	}

	return {
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
