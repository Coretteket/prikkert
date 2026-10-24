import type { RequestHandler } from '@sveltejs/kit'

import { PUBLIC_NO_INDEX, PUBLIC_ORIGIN } from '$app/env/public'

export const GET: RequestHandler = () => {
	const lines =
		PUBLIC_NO_INDEX === '1'
			? ['User-agent: *', 'Disallow: /']
			: ['User-agent: *', 'Allow: /', `Sitemap: ${PUBLIC_ORIGIN}/sitemap.xml`]
	return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain' } })
}
