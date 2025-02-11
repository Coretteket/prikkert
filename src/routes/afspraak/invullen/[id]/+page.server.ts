import { getEvent } from '@/lib/server/events'
import { error, redirect } from '@sveltejs/kit'
import * as v from '@/lib/server/validation'
import { db, schema } from '@/lib/server/db/index'
import { encodeSHA256, generateNanoid } from '@/lib/server/crypto'
import { env } from '$env/dynamic/private'
import { dev } from '$app/environment'
import { eq } from 'drizzle-orm'

export async function load({ params: { id } }) {
	const event = await getEvent(id)

	if (!event) throw error(404, 'Afspraak niet gevonden')

	return { event }
}

const AvailabilityEnum = v.picklist(['YES', 'NO', 'MAYBE'])

const AvailabilitySchema = v.object({
	optionId: v.pipe(v.string(), v.minLength(12)),
	availability: AvailabilityEnum,
})

const CreateResponseSchema = v.object({
	name: v.optional(v.string()),
	options: v.array(v.pipe(v.string(), v.transformJSON(), AvailabilitySchema)),
})

export const actions = {
	default: async ({ request, cookies, params: { id } }) => {
		const event = await db.query.events.findFirst({
			columns: { expiresAt: true },
			where: eq(schema.events.id, id),
		})

		if (!event) return error(404, 'Afspraak niet gevonden')

		const parsed = v.parseForm(CreateResponseSchema, await request.formData())
		if (parsed instanceof v.FormError) return parsed.fail()

		const token = generateNanoid(21)

		await db.transaction(async (db) => {
			const [session] = await db
				.insert(schema.sessions)
				.values({
					eventId: id,
					name: parsed.name,
					token: await encodeSHA256(token),
				})
				.returning({ id: schema.sessions.id })

			await db.insert(schema.responses).values(
				parsed.options.map(({ optionId, availability }) => ({
					optionId,
					sessionId: session.id,
					availability,
				})),
			)
		})

		cookies.set(env.COOKIE_PREFIX + id, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: !dev,
			expires: new Date(event.expiresAt),
		})

		redirect(303, `/afspraak/overzicht/${id}`)
	},
}
