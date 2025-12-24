import { error, invalid, redirect } from '@sveltejs/kit'
import { asc, eq, sql } from 'drizzle-orm'

import { form, getRequestEvent } from '$app/server'

import { encodeSHA256, generateNanoID } from '@/server/crypto'
import { validateSession } from '@/server/session/validation'
import { ID_LENGTH, TOKEN_LENGTH } from '@/server/db/schema'
import { setSessionCookie } from '@/server/session/cookies'
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
	const { locals, params } = getRequestEvent()
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

	const session = locals.session.respondent.get(eventId)

	if (session) {
		const isValid = await validateSession(session)
		if (!isValid) error(403, 'Niet toegestaan.')
	}

	const { respondentId, token } =
		session === undefined
			? { respondentId: generateNanoID(ID_LENGTH), token: generateNanoID(TOKEN_LENGTH) }
			: session

	const encodedToken = await encodeSHA256(token)

	await db.transaction(async (db) => {
		await db
			.insert(schema.respondents)
			.values({ eventId, id: respondentId, token: encodedToken, name: parsed.name })
			.onConflictDoUpdate({
				target: schema.respondents.id,
				set: { name: parsed.name },
			})

		await db
			.insert(schema.responses)
			.values(
				Object.entries(parsed.availability).map(([key, availability]) => ({
					optionId: key.replace(/^option_/, ''),
					respondentId,
					availability,
					note: parsed.note?.[key as OptionName],
				})),
			)
			.onConflictDoUpdate({
				target: [schema.responses.optionId, schema.responses.respondentId],
				set: {
					availability: sql.raw(`excluded.${schema.responses.availability.name}`),
					note: sql.raw(`excluded.${schema.responses.note.name}`),
				},
			})
	})

	setSessionCookie({
		isOrganizer: false,
		respondentId,
		eventId,
		token,
		expires: event.expiresAt,
	})

	getEventForSession(eventId).refresh()

	hasSession().set(true)

	const isOrganizer = await validateSession(
		locals.session.organizer.get(eventId),
		event.organizerToken,
	)

	if (isOrganizer || !event.hideResponses) {
		redirect(303, `/afspraak/overzicht/${eventId}`)
	}
})
