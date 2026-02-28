import { page } from '$app/state'

export const routes = new Map([
	['/afspraak/aanmaken', '/en/event/create'],
	['/afspraak/overzicht', '/en/event/overview'],
	['/afspraak/bewerken', '/en/event/edit'],
	['/afspraak/reageren', '/en/event/respond'],
	['/afspraken', '/en/events'],
	['/voorwaarden', '/en/terms'],
	['/privacy', '/en/privacy'],
	['/', '/en'],
] as const)

export const NL_PUBLIC_PATHS = [
	'/',
	'/afspraak/aanmaken',
	'/privacy',
	'/voorwaarden',
	'/sitemap.xml',
]

export const PUBLIC_PATHS = NL_PUBLIC_PATHS.flatMap((p) => {
	const en = getLocaleURL(p, 'en')
	return en === '/en' || en.startsWith('/en/') ? [p, en] : [p]
})

type Keys<T extends Map<unknown, unknown>> = T extends Map<infer V, unknown> ? V : never

export function url(path: Keys<typeof routes> | `${Keys<typeof routes>}/${string}`) {
	if (page.data.locale === 'en')
		for (const [key, value] of routes.entries())
			if (path.startsWith(key)) return value + path.slice(key.length)

	return path
}

export function getLocaleURL(path: string, locale: 'nl' | 'en') {
	const alreadyEnglish = path === '/en' || path.startsWith('/en/')
	if (locale === 'en' && alreadyEnglish) return path
	if (locale === 'nl' && !alreadyEnglish) return path

	for (const [key, value] of routes.entries())
		if (path.startsWith(locale === 'nl' ? value : key))
			return locale === 'nl' ? key + path.slice(value.length) : value + path.slice(key.length)

	return path
}
