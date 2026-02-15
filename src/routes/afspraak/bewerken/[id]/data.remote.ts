import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { query } from '$app/server'

import { requireOrganizerOrThrow } from '@/server/session/validation'
import { type OptionEntry } from '@/shared/event/types'
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

	const options = new Map<string, OptionEntry>()

	for (const { startsAt, endsAt, note } of event.options) {
		const date = Temporal.PlainDate.from(startsAt).toString()
		const hasTime = startsAt instanceof Temporal.PlainDateTime

		const entry = options.get(date) ?? { hasTime, slots: [] }

		entry.slots.push({
			note: note || undefined,
			startsAt: hasTime ? Temporal.PlainTime.from(startsAt) : undefined,
			endsAt:
				endsAt instanceof Temporal.PlainDateTime ? Temporal.PlainTime.from(endsAt) : undefined,
		})

		options.set(date, entry)
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
