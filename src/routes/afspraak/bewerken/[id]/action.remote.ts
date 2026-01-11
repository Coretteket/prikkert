import { eq, inArray, type InferSelectModel } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'

import { form, getRequestEvent } from '$app/server'

import { EventFormSchema, getExpiryDate } from '@/shared/event-schema'
import { validateSession } from '@/server/session/validation'
import { deduplicate } from '@/shared/utils'
import { db, schema } from '@/server/db'

type Option = Pick<
	InferSelectModel<typeof schema.options>,
	'id' | 'eventId' | 'startsAt' | 'endsAt'
>

const getOptionKey = (option: Pick<Option, 'startsAt' | 'endsAt'>) =>
	`${option.startsAt.toString()}-${option.endsAt?.toString() ?? 'null'}`

function getOptionsDifference(existingOptions: Option[], newOptions: Omit<Option, 'id'>[]) {
	const existingOptionMap = new Map(existingOptions.map((option) => [getOptionKey(option), option]))
	const newOptionMap = new Map(newOptions.map((option) => [getOptionKey(option), option]))

	const toDelete = Array.from(existingOptionMap.values()).flatMap((option) =>
		newOptionMap.has(getOptionKey(option)) ? [] : [option.id],
	)

	const toInsert = Array.from(newOptionMap.values()).filter(
		(option) => !existingOptionMap.has(getOptionKey(option)),
	)

	return { toInsert, toDelete }
}

export const updateEvent = form(EventFormSchema, async (parsed) => {
	const { locals } = getRequestEvent()

	if (typeof parsed.id !== 'string') error(400, 'Ongeldig ID')
	const eventId = parsed.id

	const session = locals.session.organizer.get(eventId)
	if (!session || !(await validateSession(session))) {
		error(403, 'Je bent niet de organisator van deze afspraak.')
	}

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
		parsed.options.flatMap(([date, slots]) =>
			slots.map((slot) => {
				const startTime = slot.length > 0 ? slot[0] : undefined
				const endTime = slot.length > 0 ? slot[1] : undefined
				return {
					startsAt: startTime ? date.toPlainDateTime(startTime) : date,
					endsAt: endTime ? date.toPlainDateTime(endTime) : null,
					eventId,
				}
			}),
		),
		(option) => `${option.startsAt.toString()}-${option.endsAt?.toString() ?? 'null'}`,
	)

	const expiresAt = getExpiryDate(newOptions)

	const { toInsert, toDelete } = getOptionsDifference(existingEvent.options, newOptions)

	console.log({
		parsed: JSON.stringify(parsed.options),
		existingEvent: JSON.stringify(existingEvent.options),
		newOptions: JSON.stringify(newOptions),
		toInsert,
		toDelete,
	})

	await db.transaction(async (db) => {
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

		if (toDelete.length > 0) {
			await db.delete(schema.options).where(inArray(schema.options.id, toDelete))
		}

		if (toInsert.length > 0) {
			await db.insert(schema.options).values(toInsert)
		}
	})

	redirect(303, `/afspraak/overzicht/${eventId}`)
})
