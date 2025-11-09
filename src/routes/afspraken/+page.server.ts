import type { PageServerLoad } from './$types'
import { getSessions } from '@/lib/server/events'

export const load: PageServerLoad = async ({ locals }) => {
	const sessions = await getSessions(locals.session)
	return { sessions }
}
