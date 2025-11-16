export const load = async ({ locals }) => {
	return {
		hasSession: locals.session.size > 0,
	}
}
