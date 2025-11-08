import { db, schema } from '@/lib/server/db'
import { redirect } from '@sveltejs/kit'
import { Now } from '@/lib/temporal'
import { encodeSHA256, generateNanoID } from '@/lib/server/crypto'
import { setSessionCookie } from '@/lib/server/session'
import { CreateEventSchema } from './schema.server'
import { deduplicate } from '@/lib/utils'
import { form, getRequestEvent } from '$app/server'
import { hasSession } from '@/routes/has-session.remote'
import { getEvents } from '@/routes/afspraken/get-events.remote'
import { getEvent } from '../invullen/[eventId]/get-event.remote'

export const createEvent = form(CreateEventSchema, async (parsed) => {
	const token = generateNanoID(21)
	const expiresAt = Now.instant()
		.add({ hours: 90 * 24 })
		.toString()

	const [event, options] = await db.transaction(async (db) => {
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

		const { cookies } = getRequestEvent()

		setSessionCookie({
			cookies,
			eventId: event.id,
			sessionId: session.id,
			token,
			expires: expiresAt,
		})

		const [awaitedOptions] = await Promise.all([options, organizers])

		return [event, awaitedOptions]
	})

	getEvent(event.id).set({ event: { ...event, options }, session: undefined })
	hasSession().set(true)

	redirect(303, `/afspraak/invullen/${event.id}`)
})
