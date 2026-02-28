import { eq, inArray, type InferSelectModel } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'

import { form, getRequestEvent } from '$app/server'

import { requireOrganizerOrThrow } from '@/server/session/validation'
import { getExpiryDate, getOptionKey } from '@/shared/event/utils'
import { EventFormSchema } from '@/shared/event/schema'
import { deduplicate } from '@/shared/utils'
import { db, schema } from '@/server/db'

type Option = Omit<InferSelectModel<typeof schema.options>, 'isSelected'>

function getOptionsDifference(existingOptions: Option[], newOptions: Omit<Option, 'id'>[]) {
	const existingOptionMap = new Map(existingOptions.map((option) => [getOptionKey(option), option]))
	const newOptionMap = new Map(newOptions.map((option) => [getOptionKey(option), option]))

	const toDelete = Array.from(existingOptionMap.values()).flatMap((option) =>
		newOptionMap.has(getOptionKey(option)) ? [] : [option.id],
	)

	const toInsert = Array.from(newOptionMap.values()).filter(
		(option) => !existingOptionMap.has(getOptionKey(option)),
	)

	const toUpdate = Array.from(newOptionMap.values()).flatMap((option) => {
		const existing = existingOptionMap.get(getOptionKey(option))
		if (!existing || existing.note === option.note) return []
		return [{ id: existing.id, note: option.note }]
	})

	return { toInsert, toDelete, toUpdate }
}

export const updateEvent = form(EventFormSchema, async (parsed) => {
	const { locals } = getRequestEvent()

	if (typeof parsed.id !== 'string') error(400, 'Ongeldig ID')
	const eventId = parsed.id

	await requireOrganizerOrThrow(eventId)

	const existingEvent = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		with: { options: { with: { responses: true } } },
	})

	if (!existingEvent) error(404, 'Afspraak niet gevonden')

	const hasResponses = existingEvent.options.some((o) => o.responses.length > 0)

	if (hasResponses && existingEvent.hideResponses && !parsed.hideResponses) {
		error(400, 'Je kunt de reacties niet openbaar maken nadat er gereageerd is.')
	}

	const newOptions = deduplicate(
		parsed.options.flatMap(([date, { slots }]) =>
			slots.map((slot) => ({
				startsAt: slot.startsAt
					? date.toPlainDateTime(slot.startsAt).toZonedDateTime(locals.timezone)
					: date,
				endsAt: slot.endsAt
					? date.toPlainDateTime(slot.endsAt).toZonedDateTime(locals.timezone)
					: null,
				note: slot.note || null,
				eventId,
			})),
		),
		getOptionKey,
	)

	const { toInsert, toDelete, toUpdate } = getOptionsDifference(existingEvent.options, newOptions)

	const expiresAt = getExpiryDate(newOptions)

	await db.transaction(async (db) => {
		const queries: Array<Promise<unknown>> = [
			db
				.update(schema.events)
				.set({
					title: parsed.title,
					description: parsed.description ?? '',
					organizerName: parsed.organizerName ?? '',
					allowAnonymous: parsed.allowAnonymous ?? false,
					hideResponses: parsed.hideResponses ?? false,
					expiresAt,
				})
				.where(eq(schema.events.id, eventId)),
		]

		if (toDelete.length > 0) {
			queries.push(db.delete(schema.options).where(inArray(schema.options.id, toDelete)))
		}

		if (toInsert.length > 0) {
			queries.push(db.insert(schema.options).values(toInsert))
		}

		for (const { id, note } of toUpdate) {
			queries.push(db.update(schema.options).set({ note }).where(eq(schema.options.id, id)))
		}

		await Promise.allSettled(queries)
	})

	redirect(303, `/afspraak/overzicht/${eventId}`)
})
