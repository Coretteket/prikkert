import { deleteSession } from '@/lib/server/session'
import { redirect, type Actions } from '@sveltejs/kit'

export const actions = {
	default: async ({ cookies }) => {
		await deleteSession({ cookies })
		throw redirect(303, '/')
	},
} satisfies Actions
