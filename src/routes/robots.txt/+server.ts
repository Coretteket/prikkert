import type { RequestHandler } from '@sveltejs/kit'

import { env } from '$env/dynamic/public'

export const GET: RequestHandler = () => {
	const lines = env.PUBLIC_NO_INDEX === '1'
		? ['User-agent: *', 'Disallow: /']
		: ['User-agent: *', 'Allow: /', `Sitemap: ${env.PUBLIC_ORIGIN}/sitemap.xml`]
	return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain' } })
}
