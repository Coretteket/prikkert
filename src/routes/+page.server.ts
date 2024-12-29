import type { Actions } from '@sveltejs/kit'
import { zfd } from 'zod-form-data'
import z from 'zod'

import { db } from '../db'
import { $users } from '../db/schema'

export async function load() {
	const users = await db.select({ id: $users.id, name: $users.name }).from($users)
	return { users }
}

const registerSchema = zfd.formData({
	name: zfd.text(z.string().min(1)),
	email: zfd.text(z.string().email()),
	password: zfd.text(z.string().min(8)),
})

export const actions = {
	default: async ({ request }) => {
		const data = registerSchema.parse(await request.formData())
		await db.insert($users).values(data)
	},
} satisfies Actions
