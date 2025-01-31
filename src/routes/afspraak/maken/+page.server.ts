import { db, schema } from '@/lib/server/db'
import { redirect, type Actions } from '@sveltejs/kit'
import * as v from '@/lib/server/validation'
import { zfd } from 'zod-form-data'
import { z } from 'zod'

const CreateEventSchema = zfd.formData({
	title: zfd.text(z.string({ message: 'Vul een titel in.' })),
	description: zfd.text(z.string().optional()),
	location: zfd.text(z.string().optional()),
	options: zfd.repeatable(z.array(v.plainDate()).min(1, 'Vul minstens één datum in.')),
	times: zfd.repeatable(z.array(z.string()).optional()),
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

		redirect(303, `/afspraak/${event.id}`)
	},
} satisfies Actions
