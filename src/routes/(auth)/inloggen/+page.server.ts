import { db, schema } from '@/db'
import { createSession } from '@/lib/server/session'
import { redirect, type Actions } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import argon2 from 'argon2'

const loginSchema = zfd.formData({
	email: zfd.text(z.string().email()),
	password: zfd.text(z.string().min(8)),
})

export const actions = {
	default: async ({ request, cookies }) => {
		const input = loginSchema.parse(await request.formData())

		const [user] = await db
			.select({ id: schema.users.id, passwordHash: schema.users.passwordHash })
			.from(schema.users)
			.where(eq(schema.users.email, input.email))

		if (!user || !user.passwordHash) throw new Error('Onjuist e-mailadres of wachtwoord.')

		const passwordMatch = await argon2.verify(user.passwordHash, input.password)

		if (!passwordMatch) throw new Error('Onjuist e-mailadres of wachtwoord.')

		const session = await createSession({ userId: user.id, cookies })

		if (!session) throw new Error('Er is iets misgegaan.')

		throw redirect(307, '/')
	},
} satisfies Actions
