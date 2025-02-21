import { db, schema } from '@/lib/server/db'
import { redirect, type Actions } from '@sveltejs/kit'
import { Now, type PlainDate, type PlainTime } from '@/lib/temporal'
import { encodeSHA256, generateNanoid } from '@/lib/server/crypto'
import * as v from '@/lib/server/validation'
import { setSessionCookie } from '@/lib/server/session'

const OptionTimeSchema = v.union([v.tuple([v.plainTime(), v.optional(v.plainTime())]), v.tuple([])])

const CreateEventSchema = v.object({
	title: v.string('Vul een titel in.'),
	organizer: v.optional(v.string()),
	description: v.optional(v.string()),
	location: v.optional(v.string()),
	options: v.json(
		v.pipe(
			v.array(v.tuple([v.plainDate(), v.array(OptionTimeSchema)])),
			v.minLength(1, 'Vul minstens één datum in.'),
		),
	),
})

function parseDateTimeRange(
	date: PlainDate,
	[startTime, endTime]: v.InferOutput<typeof OptionTimeSchema>,
) {
	const toDateTime = (time?: PlainTime | null) => (time ? date.toPlainDateTime(time) : undefined)

	return {
		startsAt: toDateTime(startTime) ?? date,
		endsAt: toDateTime(endTime),
	}
}

export const actions = {
	default: async ({ request, cookies }) => {
		const parsed = v.parseForm(CreateEventSchema, await request.formData())
		if (parsed instanceof v.FormError) return parsed.fail()

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

			setSessionCookie({
				cookies,
				eventId: event.id,
				sessionId: session.id,
				token,
				expires: expiresAt,
			})

			return event
		})

		redirect(303, `/afspraak/overzicht/${event.id}`)
	},
} satisfies Actions
