import { db, schema } from '@/db'
import { PlainDate } from '@/lib/temporal'
import { redirect, type Actions } from '@sveltejs/kit'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

const createEventSchema = zfd.formData({
	title: zfd.text(z.string().min(1)),
	dates: zfd
		.text(z.string().min(1))
		.transform((str) => str.split('\n').map((date) => PlainDate.from(date.trim()))),
})

export const actions = {
	default: async ({ request, locals }) => {
		const userId = locals.user?.id
		if (!userId) throw new Error('Unauthorized')

		const input = createEventSchema.parse(await request.formData())

		const event = await db.transaction(async (db) => {
			const [event] = await db
				.insert(schema.events)
				.values({ ownerId: userId, title: input.title })
				.returning()

			await db.insert(schema.eventOptions).values(
				input.dates.map((date) => ({
					eventId: event.id,
					startsAt: date.toString(),
				})),
			)

			return event
		})

		redirect(307, `/afspraak/${event.id}`)
	},
} satisfies Actions
