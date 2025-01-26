import { db, schema } from '@/db'
import { createSession } from '@/lib/server/session'
import { redirect, type Actions } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import argon2 from 'argon2'
import { checkPasswordPwned } from '@/lib/server/crypto'

const registerSchema = zfd
	.formData({
		name: z.string().min(1, 'Vul je naam in.'),
		email: z.string().email('Het ingevoerde e-mailadres is ongeldig.'),
		password: z
			.string()
			.min(8, 'Kies een wachtwoord van tenminste 8 tekens.')
			.max(255, 'Kies een wachtwoord van maximaal 255 tekens.'),
		confirmPassword: z.string().min(1, 'Herhaal je wachtwoord.'),
	})
	.superRefine(
		(value, context) =>
			value.password !== value.confirmPassword &&
			context.addIssue({
				code: 'custom',
				message: 'De ingevulde wachtwoorden komen niet overeen.',
				path: ['confirm_password'],
			}),
	)

export const actions = {
	default: async ({ request, cookies }) => {
		const input = registerSchema.parse(await request.formData())

		if (await checkPasswordPwned(input.password))
			throw new Error(
				'Dit wachtwoord is op eerder al gelekt en daarom niet veilig om te gebruiken. Kies een ander wachtwoord.',
			)

		const passwordHash = await argon2.hash(input.password)

		const [{ id }] = await db
			.insert(schema.users)
			.values({ name: input.name, email: input.email, passwordHash })
			.returning()

		const session = await createSession({ userId: id, cookies })

		if (!session) throw new Error('Er is iets misgegaan.')

		throw redirect(307, '/')
	},
} satisfies Actions
