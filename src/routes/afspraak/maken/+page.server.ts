import { db, schema } from '@/lib/server/db'
import { redirect, type Actions } from '@sveltejs/kit'
import * as v from '@/lib/server/validation'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import type { PlainDate, PlainTime } from '@/lib/temporal'

const OptionSchema = z.tuple([
	v.plainDate(),
	z.array(z.tuple([]).or(z.tuple([v.plainTime(), v.plainTime().nullable()]))),
])

const CreateEventSchema = zfd.formData({
	title: zfd.text(z.string({ message: 'Vul een titel in.' })),
	organizer: zfd.text(z.string().optional()),
	description: zfd.text(z.string().optional()),
	location: zfd.text(z.string().optional()),
	options: zfd.repeatable(
		z
			.array(
				z.string().transform((value, context) => {
					const parsed = OptionSchema.safeParse(JSON.parse(value))
					if (parsed.success) return parsed.data
					parsed.error.issues.forEach((issue) => context.addIssue(issue))
					return z.NEVER
				}),
			)
			.min(1, 'Vul minstens één datum in.'),
	),
})

function parseDateTimeRange(
	date: PlainDate,
	[startTime, endTime]: z.output<typeof OptionSchema>[1][number],
) {
	const toDateTime = (time?: PlainTime | null) => (time ? date.toPlainDateTime(time) : undefined)

	return {
		startsAt: toDateTime(startTime) ?? date,
		endsAt: toDateTime(endTime),
	}
}

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
				parsed.options.flatMap(([date, slots]) =>
					slots.map((slot) => ({
						eventId: event.id,
						...parseDateTimeRange(date, slot),
					})),
				),
			)

			return event
		})

		redirect(303, `/afspraak/overzicht/${event.id}`)
	},
} satisfies Actions
