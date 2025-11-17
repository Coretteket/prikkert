import { redirect } from '@sveltejs/kit'

import { encodeSHA256, generateNanoID } from '@/server/crypto'
import { setSessionCookie } from '@/server/session'
import { db, schema } from '@/server/db'
import * as v from '@/server/validation'
import { PlainTime } from '@/temporal'
import { deduplicate } from '@/utils'
import { Now } from '@/temporal'

const OptionTimeSchema = v.union(
	[
		v.pipe(
			v.tuple([v.plainTime(), v.nullable(v.plainTime())]),
			v.check(([a, b]) => !b || PlainTime.compare(a, b) < 1, 'Ongeldig tijdslot.'),
		),
		v.pipe(v.array(v.never()), v.length(0)),
	],
	'Ongeldig tijdslot.',
)

const MIN_TITLE_LENGTH = 3
const MAX_TITLE_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 500

const CreateEventSchema = v.object({
	title: v.pipe(
		v.string('Vul een titel in.'),
		v.minLength(MIN_TITLE_LENGTH, `Vul een titel in van minstens ${MIN_TITLE_LENGTH} tekens.`),
		v.maxLength(MAX_TITLE_LENGTH, `Vul een titel in van maximaal ${MAX_TITLE_LENGTH} tekens.`),
	),
	description: v.nullable(
		v.pipe(
			v.string(),
			v.maxLength(
				MAX_DESCRIPTION_LENGTH,
				`Vul een beschrijving in van maximaal ${MAX_DESCRIPTION_LENGTH} tekens.`,
			),
			v.transform((val) => (val.length > 0 ? val : null)),
		),
	),
	options: v.json(
		v.pipe(
			v.array(v.tuple([v.plainDate(), v.array(OptionTimeSchema)])),
			v.minLength(1, 'Vul minstens één datum in.'),
		),
	),
	settings: v.optional(
		v.strictObject(
			{ allowAnonymous: v.checkbox(), hideParticipants: v.checkbox() },
			'Vul een geldige instelling in.',
		),
	),
})

export const actions = {
	default: async ({ cookies, request }) => {
		const parsed = v.parseForm(CreateEventSchema, await request.formData())
		if (parsed instanceof v.FormError) return parsed.fail()

		const token = generateNanoID(21)
		const expiresAt = Now.instant()
			.add({ hours: 90 * 24 })
			.toString()

		const [event] = await db.transaction(async (db) => {
			const [event] = await db
				.insert(schema.events)
				.values({
					...parsed.settings,
					title: parsed.title,
					description: parsed.description,
					expiresAt,
				})
				.returning()

			const uniqueOptions = deduplicate(
				parsed.options.flatMap(([date, slots]) =>
					slots.map(([startTime, endTime]) => ({
						eventId: event.id,
						startsAt: startTime ? date.toPlainDateTime(startTime) : date,
						endsAt: endTime ? date.toPlainDateTime(endTime) : undefined,
					})),
				),
				(option) => `${option.startsAt.toString()}-${option.endsAt?.toString() ?? 'null'}`,
			)

			const options = db.insert(schema.options).values(uniqueOptions)

			const [session] = await db
				.insert(schema.sessions)
				.values({ eventId: event.id, token: await encodeSHA256(token) })
				.returning()

			const organizers = db
				.insert(schema.organizers)
				.values({ eventId: event.id, sessionId: session.id })

			setSessionCookie({
				cookies,
				eventId: event.id,
				sessionId: session.id,
				token,
				expires: expiresAt,
			})

			await Promise.all([options, organizers])

			return [event]
		})

		redirect(303, `/afspraak/invullen/${event.id}`)
	},
}
