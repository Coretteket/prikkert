import { error, redirect } from '@sveltejs/kit'
import { eq, inArray } from 'drizzle-orm'

import { form, getRequestEvent } from '$app/server'

import { EventFormSchema, getExpiryDate } from '@/shared/event-schema'
import { validateSession } from '@/server/session/validation'
import { deduplicate } from '@/shared/utils'
import { db, schema } from '@/server/db'

export const updateEvent = form(EventFormSchema, async (parsed) => {
	const { locals } = getRequestEvent()

	// parsed.id is string for edit
	if (typeof parsed.id !== 'string') error(400, 'Ongeldig ID')
	const eventId = parsed.id

	const session = locals.session.organizer.get(eventId)
	if (!session || !(await validateSession(session))) {
		error(403, 'Je bent niet de organisator van deze afspraak.')
	}

	// Fetch existing event to check privacy constraints
	const existingEvent = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		with: { options: { with: { responses: true } } },
	})

	if (!existingEvent) error(404, 'Afspraak niet gevonden')

	const hasResponses = existingEvent.options.some((o) => o.responses.length > 0)

	// Validate privacy constraints
	if (hasResponses && existingEvent.hideResponses && !parsed.hideResponses) {
		// Trying to make public when it was private
		error(400, 'Je kunt de reacties niet openbaar maken nadat er gereageerd is.')
	}

	// Prepare options
	const newOptionsList = deduplicate(
		parsed.options.flatMap(([date, slots]) =>
			slots.map((slot) => {
				// slot is [start, end] or []
				const startTime = slot.length > 0 ? slot[0] : undefined
				const endTime = slot.length > 0 ? slot[1] : undefined
				return {
					startsAt: startTime ? date.toPlainDateTime(startTime) : date,
					endsAt: endTime ? date.toPlainDateTime(endTime) : undefined,
					eventId,
				}
			}),
		),
		(option) => `${option.startsAt.toString()}-${option.endsAt?.toString() ?? 'null'}`,
	)

	const expiresAt = getExpiryDate(newOptionsList)

	await db.transaction(async (db) => {
		// Update event details
		await db
			.update(schema.events)
			.set({
				title: parsed.title,
				description: parsed.description ?? '',
				organizerName: parsed.organizerName ?? '',
				allowAnonymous: parsed.allowAnonymous ?? false,
				hideResponses: parsed.hideResponses ?? false,
				expiresAt,
			})
			.where(eq(schema.events.id, eventId))

		// Sync options
		const existingOptionsMap = new Map(
			existingEvent.options.map((o) => [
				`${o.startsAt.toString()}-${o.endsAt?.toString() ?? 'null'}`,
				o,
			]),
		)

		const newOptionsSet = new Set<string>()
		const optionsToInsert: typeof newOptionsList = []

		for (const opt of newOptionsList) {
			const key = `${opt.startsAt.toString()}-${opt.endsAt?.toString() ?? 'null'}`
			newOptionsSet.add(key)
			if (!existingOptionsMap.has(key)) {
				optionsToInsert.push(opt)
			}
		}

		const optionsToDelete = existingEvent.options.filter((o) => {
			const key = `${o.startsAt.toString()}-${o.endsAt?.toString() ?? 'null'}`
			return !newOptionsSet.has(key)
		})

		if (optionsToDelete.length > 0) {
			await db.delete(schema.options).where(
				inArray(
					schema.options.id,
					optionsToDelete.map((o) => o.id),
				),
			)
		}

		if (optionsToInsert.length > 0) {
			await db.insert(schema.options).values(optionsToInsert)
		}
	})

	redirect(303, `/afspraak/overzicht/${eventId}`)
})
