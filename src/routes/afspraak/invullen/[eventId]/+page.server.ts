import { getEvent } from '@/lib/server/events'
import { error, redirect } from '@sveltejs/kit'
import * as v from '@/lib/server/validation'
import { db, schema } from '@/lib/server/db/index'
import { encodeSHA256, generateNanoid } from '@/lib/server/crypto'
import { setSessionCookie } from '@/lib/server/session'
import { eq } from 'drizzle-orm'

export async function load({ locals, params: { eventId } }) {
	const event = await getEvent(eventId)

	if (!event) throw error(404, 'Afspraak niet gevonden')

	const sessionId = locals.session.get(eventId)?.id
	if (!sessionId) return { event }

	const session = await db.query.sessions.findFirst({
		where: eq(schema.sessions.id, sessionId),
		with: { responses: true },
	})

	return { event, session }
}

const CreateResponseSchema = v.object({
	name: v.optional(v.string()),
	options: v.array(
		v.json(
			v.object({
				optionId: v.pipe(v.string(), v.minLength(12)),
				availability: v.picklist(['YES', 'NO', 'MAYBE']),
			}),
		),
	),
})

export const actions = {
	default: async ({ request, locals, cookies, params: { eventId } }) => {
		const event = await db.query.events.findFirst({
			columns: { expiresAt: true },
			where: eq(schema.events.id, eventId),
		})

		if (!event) return error(404, 'Afspraak niet gevonden')

		const parsed = v.parseForm(CreateResponseSchema, await request.formData())
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

			await db.insert(schema.responses).values(
				parsed.options.map(({ optionId, availability }) => ({
					optionId,
					sessionId,
					availability,
				})),
			)
		})

		setSessionCookie({ cookies, sessionId, eventId, token, expires: event.expiresAt })

		redirect(303, `/afspraak/overzicht/${eventId}`)
	},
}
