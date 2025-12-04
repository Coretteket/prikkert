import { redirect } from '@sveltejs/kit'

import { form, getRequestEvent } from '$app/server'

import { encodeSHA256, generateNanoID } from '@/server/crypto'
import { setSessionCookie } from '@/server/session'
import { PlainTime } from '@/shared/temporal'
import { deduplicate } from '@/shared/utils'
import { db, schema } from '@/server/db'
import * as v from '@/server/validation'
import { Now } from '@/shared/temporal'

import { hasSession } from '../../data.remote'

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

const CreateEventSchema = v.strictObject({
	title: v.pipe(
		v.string('Vul een titel in.'),
		v.minLength(MIN_TITLE_LENGTH, `Vul een titel in van minstens ${MIN_TITLE_LENGTH} tekens.`),
		v.maxLength(MAX_TITLE_LENGTH, `Vul een titel in van maximaal ${MAX_TITLE_LENGTH} tekens.`),
	),
	description: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(
				MAX_DESCRIPTION_LENGTH,
				`Vul een beschrijving in van maximaal ${MAX_DESCRIPTION_LENGTH} tekens.`,
			),
			v.transform((val) => (val.length > 0 ? val : undefined)),
		),
		'',
	),
	organizerName: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(MAX_TITLE_LENGTH, `Vul een naam in van maximaal ${MAX_TITLE_LENGTH} tekens.`),
			v.transform((val) => (val.length > 0 ? val : undefined)),
		),
	),
	options: v.json(
		v.pipe(
			v.array(v.tuple([v.plainDate(), v.array(OptionTimeSchema)])),
			v.minLength(1, 'Selecteer minstens 1 datum.'),
		),
	),
	settings: v.optional(
		v.strictObject(
			{ allowAnonymous: v.boolean(), hideParticipants: v.boolean() },
			'Vul een geldige instelling in.',
		),
	),
})

export const createEvent = form(CreateEventSchema, async (parsed) => {
	const { cookies } = getRequestEvent()

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
				organizerName: parsed.organizerName,
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

		const [session] = await db
			.insert(schema.sessions)
			.values({
				eventId: event.id,
				token: await encodeSHA256(token),
				name: parsed.organizerName,
				isOwner: true,
			})
			.returning()

		await db.insert(schema.options).values(uniqueOptions)

		setSessionCookie({
			cookies,
			eventId: event.id,
			sessionId: session.id,
			token,
			expires: expiresAt,
		})

		return [event]
	})

	hasSession().set(true)

	redirect(303, `/afspraak/invullen/${event.id}`)
})
