import { db, schema } from '@/lib/server/db'
import { type Actions } from '@sveltejs/kit'
import * as v from '@/lib/server/validation'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import argon2 from 'argon2'
import { checkPasswordPwned } from '@/lib/server/crypto'

const RegisterSchema = zfd
	.formData({
		name: z.string().min(1, 'Vul je naam in.'),
		email: z.string().email('Vul een geldig e-mailadres in.'),
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
				path: ['confirmPassword'],
			}),
	)

const UNSAFE_PASSWORD_MSG =
	'Dit wachtwoord is onveilig, omdat het voorkomt in een lijst van gelekte wachtwoorden. Kies een ander wachtwoord.'

export const actions = {
	default: async ({ request }) => {
		const parsed = await v.parse(request.formData(), RegisterSchema)
		if (parsed instanceof v.error) return parsed.fail()

		if (await checkPasswordPwned(parsed.password)) {
			return v.fail(400, { password: [UNSAFE_PASSWORD_MSG] })
		}

		const passwordHash = await argon2.hash(parsed.password)

		try {
			await db
				.insert(schema.users)
				.values({ name: parsed.name, email: parsed.email, passwordHash })
				.returning()

			return { successMessage: 'Check je e-mail om je account te activeren.' }
		} catch {
			console.warn('Failed to insert user', { name: parsed.name, email: parsed.email })
			return v.fail(500, 'Er is iets misgegaan. Probeer het later opnieuw.')
		}
	},
} satisfies Actions
