export function load({ locals }) {
	return { hasSession: locals.session.size > 0 }
}
