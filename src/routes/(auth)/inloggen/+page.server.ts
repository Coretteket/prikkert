import { db, schema } from '@/lib/server/db'
import { createSession } from '@/lib/server/session'
import { redirect, type Actions } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import * as v from '@/lib/server/validation'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import argon2 from 'argon2'

const LoginSchema = zfd.formData({
	email: z.string().email('Vul een geldig e-mailadres in.'),
	password: z.string().min(8, 'Vul een wachtwoord van tenminste 8 tekens in.'),
})

export const actions = {
	default: async ({ request, cookies }) => {
		const parsed = await v.parse(request.formData(), LoginSchema)
		if (parsed instanceof v.error) return parsed.fail()

		const [user] = await db
			.select({ id: schema.users.id, passwordHash: schema.users.passwordHash })
			.from(schema.users)
			.where(eq(schema.users.email, parsed.email))

		if (!user || !user.passwordHash) return v.fail(401, 'Onjuist e-mailadres of wachtwoord.')

		const passwordMatch = await argon2.verify(user.passwordHash, parsed.password)
		if (!passwordMatch) return v.fail(401, 'Onjuist e-mailadres of wachtwoord.')

		const session = await createSession({ userId: user.id, cookies })
		if (!session) return v.fail(500, 'Er is iets misgegaan.')

		throw redirect(303, '/')
	},
} satisfies Actions
