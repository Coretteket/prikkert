import { getEvent } from '@/lib/server/events'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import * as v from '@/lib/server/validation'
import { db, schema } from '@/lib/server/db/index'
import { encodeSHA256, generateNanoid } from '@/lib/server/crypto'
import { Now } from '@/lib/temporal'
import { COOKIE_PREFIX } from '$env/static/private'
import { dev } from '$app/environment'
import { eq } from 'drizzle-orm'

export async function load({ params: { id } }) {
	const event = await getEvent(id)

	if (!event) throw error(404, 'Afspraak niet gevonden')

	return { event }
}

const AvailabilityEnum = z.enum(['YES', 'NO', 'MAYBE'])

const AvailabilitySchema = z.object({
	optionId: z.string().length(12),
	availability: AvailabilityEnum,
})

const CreateResponseSchema = zfd.formData({
	name: zfd.text(z.string().optional()),
	options: zfd.repeatable(
		z.array(
			z.string().transform((value, context) => {
				const parsed = AvailabilitySchema.safeParse(JSON.parse(value))
				if (parsed.success) return parsed.data
				parsed.error.issues.forEach((issue) => context.addIssue(issue))
				return z.NEVER
			}),
		),
	),
})

export const actions = {
	default: async ({ request, cookies, params: { id } }) => {
		const event = await db.query.events.findFirst({
			columns: { expiresAt: true },
			where: eq(schema.events.id, id),
		})

		if (!event) return error(404, 'Afspraak niet gevonden')

		const parsed = await v.parse(request.formData(), CreateResponseSchema)
		if (parsed instanceof v.error) return parsed.fail()

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

		cookies.set(COOKIE_PREFIX + id, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: !dev,
			expires: new Date(event.expiresAt),
		})

		redirect(303, `/afspraak/overzicht/${id}`)
	},
}
