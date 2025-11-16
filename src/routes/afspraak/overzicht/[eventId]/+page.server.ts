import { error } from '@sveltejs/kit'
import { asc, eq, sql } from 'drizzle-orm'

import { encodeSHA256, generateNanoID } from '@/server/crypto'
import { db, schema } from '@/server/db'
import { setSessionCookie } from '@/server/session'
import * as v from '@/server/validation'

export const load = async ({ params }) => {
	const eventId = params.eventId

	if (!eventId) error(404, 'Afspraak niet gevonden')

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: { hideParticipants: false, createdAt: false, expiresAt: false },
		with: {
			options: {
				columns: { eventId: false },
				with: { responses: { with: { session: { columns: { name: true } } } } },
				orderBy: [asc(schema.options.startsAt)],
			},
		},
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	return {
		event,
	}
}

const AvailabilitySchema = v.picklist(['YES', 'NO', 'MAYBE'], 'Vul je beschikbaarheid in.')

type OptionName = `option_${string}`

const createResponseSchema = (event: { options: Array<{ id: string }>; allowAnonymous: boolean }) =>
	v.object({
		name: event.allowAnonymous ? v.nullable(v.string()) : v.string('Vul je naam in.'),
		availability: v.strictObject(
			v.entriesFromList(
				event.options.map((o) => o.id),
				AvailabilitySchema,
			),
			'Vul je beschikbaarheid in.',
		),
		note: v.optional(
			v.strictObject(
				v.entriesFromList(
					event.options.map((o) => o.id),
					v.optional(v.nullable(v.pipe(v.string(), v.maxLength(500, 'Opmerking is te lang.')))),
				),
			),
		),
	})

export const actions = {
	default: async ({ locals, cookies, params, request }) => {
		const eventId = params.eventId

		const event = await db.query.events.findFirst({
			with: { options: { orderBy: [asc(schema.options.startsAt)] } },
			where: eq(schema.events.id, eventId),
		})

		if (!event) error(404, 'Afspraak niet gevonden')

		const ResponseSchema = createResponseSchema(event)

		const parsed = v.parseForm(ResponseSchema, await request.formData())
		if (parsed instanceof v.FormError) return parsed.fail()

		const localsSession = locals.session.get(eventId)
		const sessionId = localsSession?.id ?? generateNanoID(16)
		const token = localsSession?.token ?? generateNanoID(21)
		const encodedToken = await encodeSHA256(token)

		await db.transaction(async (db) => {
			await db
				.insert(schema.sessions)
				.values({ eventId, id: sessionId, token: encodedToken, name: parsed.name })
				.onConflictDoUpdate({
					target: schema.sessions.id,
					set: { name: parsed.name },
				})

			await db
				.insert(schema.responses)
				.values(
					Object.entries(parsed.availability).map(([optionId, availabilityValue]) => ({
						optionId,
						sessionId,
						availability: availabilityValue,
						note: parsed.note?.[optionId as OptionName] ?? null,
					})),
				)
				.onConflictDoUpdate({
					target: [schema.responses.optionId, schema.responses.sessionId],
					set: {
						availability: sql.raw(`excluded.${schema.responses.availability.name}`),
						note: sql.raw(`excluded.${schema.responses.note.name}`),
					},
				})
		})

		setSessionCookie({ cookies, sessionId, eventId, token, expires: event.expiresAt })

		return { success: true }
	},
}
