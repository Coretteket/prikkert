import { db, schema } from '@/db'
import { redirect, type Actions } from '@sveltejs/kit'
import * as v from '@/lib/server/validation'
import { zfd } from 'zod-form-data'
import { z } from 'zod'

const CreateEventSchema = zfd.formData({
	title: zfd.text(z.string({ message: 'Vul een titel in.' })),
	options: zfd.repeatable(z.array(v.plainDate()).min(1, 'Vul minstens één datum in.')),
})

export const actions = {
	default: async ({ locals, request }) => {
		const userId = locals.session?.userId
		if (!userId) return v.fail(401, 'Je bent niet ingelogd.')

		const parsed = await v.parse(request.formData(), CreateEventSchema)
		if (parsed instanceof v.error) return parsed.fail()

		const event = await db.transaction(async (db) => {
			const [event] = await db
				.insert(schema.events)
				.values({ ownerId: userId, title: parsed.title })
				.returning()

			await db.insert(schema.eventOptions).values(
				parsed.options.map((date) => ({
					eventId: event.id,
					startsAt: date.toZonedDateTime('UTC').toInstant().toString(),
				})),
			)

			return event
		})

		redirect(307, `/afspraak/${event.id}`)
	},
} satisfies Actions
