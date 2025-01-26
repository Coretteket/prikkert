import { deleteSession } from '@/lib/server/session'
import { redirect, type Actions } from '@sveltejs/kit'

export const actions = {
	default: async ({ cookies, locals }) => {
		await deleteSession({ cookies })
		locals.session = null
		throw redirect(307, '/')
	},
} satisfies Actions
