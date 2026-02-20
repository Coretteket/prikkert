import type { RequestHandler } from '@sveltejs/kit'

import { PUBLIC_PATHS } from '../../hooks.server'

export const GET: RequestHandler = async () => {
	return new Response(
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${PUBLIC_PATHS.map(
	(path) => `	<url>
		<loc>https://prikkert.nl${path}</loc>
	</url>`,
).join('\n')}
</urlset>`,
		{ headers: { 'Content-Type': 'application/xml' } },
	)
}
