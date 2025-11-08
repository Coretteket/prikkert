import { form, getRequestEvent } from '$app/server'
import * as v from '@/lib/server/validation'
import { db, schema } from '@/lib/server/db/index'
import { encodeSHA256, generateNanoID } from '@/lib/server/crypto'
import { setSessionCookie } from '@/lib/server/session'
import { eq, sql } from 'drizzle-orm'
import { getEvent } from './get-event.remote'

const AvailabilitySchema = v.picklist(['YES', 'NO', 'MAYBE'], 'Vul je beschikbaarheid in.')

type OptionName = `option_${string}`

const createResponseSchema = (event: {
	options: Array<{ id: string }>
	disallowAnonymous: boolean
}) =>
	v.object({
		name: event.disallowAnonymous ? v.string('Vul je naam in.') : v.optional(v.string()),
		availability: v.strictObject(
			v.entriesFromList(
				event.options.map((o) => ('option_' + o.id) as OptionName),
				AvailabilitySchema,
			),
			'Vul je beschikbaarheid in.',
		),
		note: v.optional(
			v.strictObject(
				v.entriesFromList(
					event.options.map((o) => ('option_' + o.id) as OptionName),
					v.optional(v.pipe(v.string(), v.maxLength(500, 'Opmerking is te lang.'))),
				),
			),
		),
	})

export const submitResponse = form('unchecked', async (raw, invalid) => {
	const { locals, cookies, params } = getRequestEvent()
	const eventId = params.eventId as string

	console.log(raw)

	const event = await db.query.events.findFirst({
		with: { options: true },
		where: eq(schema.events.id, eventId),
	})

	if (!event) throw new Error('Afspraak niet gevonden')

	const ResponseSchema = createResponseSchema(event)

	const result = v.safeParse(ResponseSchema, raw)

	if (!result.success) {
		invalid(...handleValidationErrors(result.issues))
		return
	}

	const data = result.output

	const localsSession = locals.session.get(eventId)
	const sessionId = localsSession?.id ?? generateNanoID(12)
	const token = localsSession?.token ?? generateNanoID(21)
	const encodedToken = await encodeSHA256(token)

	console.log({ parsed: data })

	const [session, responses] = await db.transaction(async (db) => {
		const [session] = await db
			.insert(schema.sessions)
			.values({ eventId, id: sessionId, token: encodedToken, name: data.name })
			.onConflictDoUpdate({
				target: schema.sessions.id,
				set: { name: data.name },
			})
			.returning()

		const responses = await db
			.insert(schema.responses)
			.values(
				Object.entries(data.availability).map(([optionName, availabilityValue]) => ({
					optionId: optionName.replace('option_', ''),
					sessionId,
					availability: availabilityValue,
					note: data.note?.[optionName as OptionName] ?? null,
				})),
			)
			.onConflictDoUpdate({
				target: [schema.responses.optionId, schema.responses.sessionId],
				set: {
					availability: sql.raw(`excluded.${schema.responses.availability.name}`),
					note: sql.raw(`excluded.${schema.responses.note.name}`),
				},
			})
			.returning()

		return [session, responses]
	})

	setSessionCookie({ cookies, sessionId, eventId, token, expires: event.expiresAt })

	getEvent(eventId).set({
		event,
		session: { ...session, responses: new Map(responses.map((r) => [r.optionId, r])) },
	})
})

function handleValidationErrors(issues: [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]]) {
	const flatErrors = v.flatten(issues)
	type Issue = { message: string; path?: ReadonlyArray<PropertyKey> | undefined }
	const validationIssues: Array<Issue> = []

	if (flatErrors.root) validationIssues.push(...flatErrors.root.map((message) => ({ message })))

	if (flatErrors.nested)
		for (const [key, messages] of Object.entries(flatErrors.nested)) {
			if (messages?.[0]) validationIssues.push({ message: messages[0], path: [key] })
		}

	return validationIssues
}
