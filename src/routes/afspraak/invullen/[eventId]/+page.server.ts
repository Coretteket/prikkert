import { error } from '@sveltejs/kit'
import * as v from '@/lib/server/validation'
import { db, schema } from '@/lib/server/db/index'
import { encodeSHA256, generateNanoid } from '@/lib/server/crypto'
import { setSessionCookie } from '@/lib/server/session'
import { asc, eq, sql } from 'drizzle-orm'

export async function load({ locals, params: { eventId } }) {
	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: { hideParticipants: false, createdAt: false, expiresAt: false },
		with: { options: { columns: { eventId: false }, orderBy: [asc(schema.options.startsAt)] } },
	})

	if (!event) throw error(404, 'Afspraak niet gevonden')

	const sessionId = locals.session.get(eventId)?.id

	if (!sessionId) return { event, session: undefined }

	const session = await db.query.sessions.findFirst({
		where: eq(schema.sessions.id, sessionId),
		columns: { id: true, name: true },
		with: { responses: { columns: { optionId: true, availability: true } } },
	})

	if (!session) return { event, session: undefined }

	return {
		event,
		session: {
			...session,
			responses: new Map(
				session.responses.map((response) => [response.optionId, response.availability]),
			),
		},
	}
}

const AvailabilitySchema = v.picklist(['YES', 'NO', 'MAYBE'], 'Vul je beschikbaarheid in.')

const createResponseSchema = (event: {
	options: Array<{ id: string }>
	disallowAnonymous: boolean
}) =>
	v.object({
		name: event.disallowAnonymous ? v.string('Vul je naam in.') : v.nullable(v.string()),
		availability: v.object(
			Object.fromEntries(event.options.map((o) => [o.id, AvailabilitySchema])),
		),
	})

export const actions = {
	default: async ({ request, locals, cookies, params: { eventId } }) => {
		const event = await db.query.events.findFirst({
			with: { options: { columns: { id: true } } },
			columns: { expiresAt: true, disallowAnonymous: true },
			where: eq(schema.events.id, eventId),
		})

		if (!event) return error(404, 'Afspraak niet gevonden')

		const ResponseSchema = createResponseSchema(event)

		const parsed = v.parseForm(ResponseSchema, await request.formData())
		if (parsed instanceof v.FormError) return parsed.fail()

		const session = locals.session.get(eventId)
		const sessionId = session?.id ?? generateNanoid(12)
		const token = session?.token ?? generateNanoid(21)
		const encodedToken = await encodeSHA256(token)

		await db.transaction(async (db) => {
			await db
				.insert(schema.sessions)
				.values({ eventId, id: sessionId, token: encodedToken, name: parsed.name })
				.onConflictDoUpdate({ target: schema.sessions.id, set: { name: parsed.name } })

			await db
				.insert(schema.responses)
				.values(
					Object.entries(parsed.availability).map(([optionId, availability]) => ({
						optionId,
						sessionId,
						availability,
					})),
				)
				.onConflictDoUpdate({
					target: [schema.responses.optionId, schema.responses.sessionId],
					set: { availability: sql.raw(`excluded.${schema.responses.availability.name}`) },
				})
		})

		setSessionCookie({ cookies, sessionId, eventId, token, expires: event.expiresAt })

		// redirect(303, `/afspraak/overzicht/${eventId}`)
	},
}
