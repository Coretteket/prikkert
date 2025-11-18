import { asc, eq, sql } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

import { query, form, getRequestEvent } from '$app/server'

import { encodeSHA256, generateNanoID } from '@/server/crypto'
import { setSessionCookie } from '@/server/session'
import { db, schema } from '@/server/db'
import * as v from '@/server/validation'

export const getEventData = query(v.optional(v.string()), async (eventId) => {
	if (!eventId) error(404, 'Afspraak niet gevonden')

	const event = await db.query.events.findFirst({
		where: eq(schema.events.id, eventId),
		columns: { hideParticipants: false, createdAt: false, expiresAt: false },
		with: { options: { columns: { eventId: false }, orderBy: [asc(schema.options.startsAt)] } },
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const sessionId = getRequestEvent().locals.session.get(eventId)?.id

	if (!sessionId) return { event, session: undefined }

	const session = await db.query.sessions.findFirst({
		where: eq(schema.sessions.id, sessionId),
		columns: { id: true, name: true },
		with: { responses: true },
	})

	if (!session) return { event, session: undefined }

	return {
		event,
		session: {
			...session,
			responses: new Map(session.responses.map((response) => [response.optionId, response])),
		},
	}
})

const AvailabilitySchema = v.picklist(['YES', 'NO', 'MAYBE'], 'Vul je beschikbaarheid in.')

type OptionName = `option_${string}`

const createResponseSchema = (event: { options: Array<{ id: string }>; allowAnonymous: boolean }) =>
	v.object({
		name: event.allowAnonymous
			? v.nullable(v.string())
			: v.pipe(v.string('Vul je naam in.'), v.minLength(1, 'Vul je naam in.')),
		availability: v.strictObject(
			v.entriesFromList(
				event.options.map((o) => `option_${o.id}`),
				AvailabilitySchema,
			),
			'Vul je beschikbaarheid in.',
		),
		note: v.optional(
			v.strictObject(
				v.entriesFromList(
					event.options.map((o) => `option_${o.id}`),
					v.optional(
						v.nullable(
							v.pipe(v.string(), v.maxLength(500, 'Opmerkingen mogen maximaal 500 tekens zijn.')),
						),
					),
				),
			),
		),
	})

function handleValidationErrors(issues: [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]]) {
	const flatErrors = v.flatten(issues)
	const validationIssues: Array<{ message: string; path?: Array<string> }> = []
	if (flatErrors.nested)
		for (const [key, messages] of Object.entries(flatErrors.nested))
			if (messages && messages.length > 0)
				validationIssues.push({ message: messages[0], path: [key] })
	return validationIssues
}

export const submitAvailability = form('unchecked', async (formData, invalid) => {
	const { locals, cookies, params } = getRequestEvent()
	const eventId = params.eventId

	if (!eventId) error(404, 'Afspraak niet gevonden')

	const event = await db.query.events.findFirst({
		with: { options: { orderBy: [asc(schema.options.startsAt)] } },
		where: eq(schema.events.id, eventId),
	})

	if (!event) error(404, 'Afspraak niet gevonden')

	const ResponseSchema = createResponseSchema(event)

	const result = v.safeParse(ResponseSchema, formData)

	if (!result.success) throw invalid(...handleValidationErrors(result.issues))

	const parsed = result.output

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
				Object.entries(parsed.availability).map(([key, availabilityValue]) => {
					const optionId = key.replace(/^option_/, '')
					return {
						optionId,
						sessionId,
						availability: availabilityValue,
						note: parsed.note?.[key as OptionName] ?? null,
					}
				}),
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

	getEventData(eventId).refresh()

	return { success: true }
})
