import { asc, eq, sql } from 'drizzle-orm'
import { error } from '@sveltejs/kit'

import { form, getRequestEvent } from '$app/server'

import { encodeSHA256, generateNanoID } from '@/server/crypto'
import { setSessionCookie } from '@/server/session'
import { db, schema } from '@/server/db'
import * as v from '@/server/validation'

import { getEventSession } from './get-event-session.remote'

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

	getEventSession(eventId).refresh()

	return { success: true }
})
