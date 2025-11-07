import { db, schema } from '@/lib/server/db'
import { redirect, type Actions } from '@sveltejs/kit'
import { Now } from '@/lib/temporal'
import { encodeSHA256, generateNanoid } from '@/lib/server/crypto'
import * as v from '@/lib/server/validation'
import { setSessionCookie } from '@/lib/server/session'
import { CreateEventSchema } from './schema.server'

export const actions = {
	default: async ({ request, cookies }) => {
		const parsed = v.parseForm(CreateEventSchema, await request.formData())
		if (parsed instanceof v.FormError) return parsed.fail()
		console.log(parsed)

		const token = generateNanoid(21)
		const expiresAt = Now.instant()
			.add({ hours: 90 * 24 })
			.toString()

		const event = await db.transaction(async (db) => {
			const [event] = await db
				.insert(schema.events)
				.values({
					...parsed.settings,
					title: parsed.title,
					description: parsed.description,
					expiresAt,
				})
				.returning()

			const options = db.insert(schema.options).values(
				parsed.options.flatMap(([date, slots]) =>
					slots.map(([startTime, endTime]) => ({
						eventId: event.id,
						startsAt: startTime ? date.toPlainDateTime(startTime) : date,
						endsAt: endTime ? date.toPlainDateTime(endTime) : undefined,
					})),
				),
			)

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

			await Promise.allSettled([options, organizers])

			return event
		})

		redirect(303, `/afspraak/overzicht/${event.id}`)
	},
} satisfies Actions
