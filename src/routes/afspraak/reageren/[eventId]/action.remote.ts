import { error, invalid, redirect } from '@sveltejs/kit'
import { asc, eq, sql } from 'drizzle-orm'

import { form, getRequestEvent } from '$app/server'

import { encodeSHA256, generateNanoID } from '@/server/crypto'
import { ID_LENGTH, TOKEN_LENGTH } from '@/server/db/schema'
import { setSessionCookie } from '@/server/session'
import { db, schema } from '@/server/db'
import * as v from '@/server/validation'

import { getEventForSession } from './data.remote'
import { hasSession } from '../../../data.remote'

const AvailabilitySchema = v.picklist(['YES', 'NO', 'MAYBE'], 'Vul je beschikbaarheid in.')

type OptionName = `option_${string}`

const createResponseSchema = (event: { options: Array<{ id: string }>; allowAnonymous: boolean }) =>
	v.object({
		name: event.allowAnonymous
			? v.pipe(
					v.nullable(v.string()),
					v.transform((name) => (name?.trim() === '' ? null : name)),
				)
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
							v.pipe(
								v.string(),
								v.maxLength(200, 'Opmerkingen mogen maximaal 200 tekens zijn.'),
								v.transform((s) => {
									const trimmed = s.replaceAll(/\s*\n\s*/g, ' ').trim()
									return trimmed === '' ? null : trimmed
								}),
							),
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

export const submitAvailability = form('unchecked', async (formData) => {
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
	const sessionId = localsSession?.id ?? generateNanoID(ID_LENGTH)
	const token = localsSession?.token ?? generateNanoID(TOKEN_LENGTH)
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
				Object.entries(parsed.availability).map(([key, availability]) => ({
					optionId: key.replace(/^option_/, ''),
					sessionId,
					availability,
					note: parsed.note?.[key as OptionName],
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

	getEventForSession(eventId).refresh()

	hasSession().set(true)

	redirect(303, `/afspraak/overzicht/${eventId}`)
})
