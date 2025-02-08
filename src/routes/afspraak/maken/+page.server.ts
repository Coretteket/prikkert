import { db, schema } from '@/lib/server/db'
import { redirect, type Actions } from '@sveltejs/kit'
import * as v from '@/lib/server/validation'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { Now, type PlainDate, type PlainTime } from '@/lib/temporal'
import { encodeSHA256, generateNanoid } from '@/lib/server/crypto'
import { COOKIE_PREFIX } from '$env/static/private'
import { dev } from '$app/environment'

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
	default: async ({ request, cookies }) => {
		const parsed = await v.parse(request.formData(), CreateEventSchema)
		if (parsed instanceof v.error) return parsed.fail()

		const token = generateNanoid(21)
		const expiresAt = Now.instant()
			.add({ hours: 90 * 24 })
			.toString()

		const event = await db.transaction(async (db) => {
			const [event] = await db
				.insert(schema.events)
				.values({
					title: parsed.title,
					expiresAt,
				})
				.returning()

			await db.insert(schema.options).values(
				parsed.options.flatMap(([date, slots]) =>
					slots.map((slot) => ({
						eventId: event.id,
						...parseDateTimeRange(date, slot),
					})),
				),
			)

			const [session] = await db
				.insert(schema.sessions)
				.values({
					token: await encodeSHA256(token),
					eventId: event.id,
					name: parsed.organizer,
				})
				.returning()

			await db.insert(schema.organizers).values({
				eventId: event.id,
				sessionId: session.id,
			})

			return event
		})

		cookies.set(COOKIE_PREFIX + event.id, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: !dev,
			expires: new Date(expiresAt),
		})

		redirect(303, `/afspraak/overzicht/${event.id}`)
	},
} satisfies Actions
