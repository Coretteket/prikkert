import type { RequestHandler } from '@sveltejs/kit'

import { getLocaleURL, NL_PUBLIC_PATHS } from '../../lib/shared/url'

function makeUrlEntry(path: string) {
	const nl = 'https://prikkert.nl' + getLocaleURL(path, 'nl')
	const en = 'https://prikkert.nl' + getLocaleURL(path, 'en')
	return [
		`<url>`,
		`  <loc>${nl}</loc>`,
		`  <xhtml:link rel="alternate" hreflang="nl" href="${nl}" />`,
		`  <xhtml:link rel="alternate" hreflang="en" href="${en}" />`,
		`</url>`,
		`<url>`,
		`  <loc>${en}</loc>`,
		`  <xhtml:link rel="alternate" hreflang="nl" href="${nl}" />`,
		`  <xhtml:link rel="alternate" hreflang="en" href="${en}" />`,
		`</url>`,
	].join('\n')
}

export const GET: RequestHandler = async () => {
	const paths = NL_PUBLIC_PATHS.filter((path) => path !== '/sitemap.xml')

	const sitemap = [
		'<?xml version="1.0" encoding="UTF-8" ?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		...paths.map((path) => makeUrlEntry(path)),
		'</urlset>',
	].join('\n')
	return new Response(sitemap, { headers: { 'Content-Type': 'application/xml' } })
}
