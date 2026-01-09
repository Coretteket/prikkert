import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { getRequestEvent, query } from '$app/server'

import type { SerializedOption, SerializedSlot } from '@/shared/event-types'

import { validateSession } from '@/server/session/validation'
import { Temporal } from '@/shared/temporal'
import { db, schema } from '@/server/db'
import * as v from '@/server/validation'

export const getEditEvent = query(v.string(), async (eventId) => {
	const { locals } = getRequestEvent()
	const session = locals.session.organizer.get(eventId)

	if (!session || !(await validateSession(session))) {
		error(403, 'Je bent niet de organisator van deze afspraak.')
	}

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		with: { options: { with: { responses: true } } },
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const optionsMap = new Map<string, SerializedSlot[]>()

	for (const option of event.options) {
		const dateStr = (
			option.startsAt instanceof Temporal.PlainDateTime
				? option.startsAt.toPlainDate()
				: option.startsAt
		).toString()

		if (!optionsMap.has(dateStr)) optionsMap.set(dateStr, [])

		if (option.startsAt instanceof Temporal.PlainDate) {
			optionsMap.get(dateStr)!.push([])
		} else {
			const start = (option.startsAt as Temporal.PlainDateTime).toPlainTime().toString().slice(0, 5)
			const end =
				option.endsAt instanceof Temporal.PlainDateTime
					? option.endsAt.toPlainTime().toString().slice(0, 5)
					: undefined
			optionsMap.get(dateStr)!.push([start, end ?? undefined])
		}
	}

	const formattedOptions: SerializedOption[] = Array.from(optionsMap.entries())

	const formData = {
		id: event.id,
		title: event.title,
		description: event.description ?? '',
		organizerName: event.organizerName ?? undefined,
		options: formattedOptions,
		allowAnonymous: event.allowAnonymous,
		hideResponses: event.hideResponses,
	}

	return {
		event,
		hasResponses: event.options.some((o) => o.responses.length > 0),
		formData,
	}
})
