import type { Reroute, Transport } from '@sveltejs/kit'

import { Temporal } from '@/shared/temporal'

import { routes as forwardRoutes } from './lib/shared/url'

const routes = Array.from(forwardRoutes.entries()).map(([nl, en]) => [en, nl])

export const reroute = (({ url }) => {
	const route = routes.find(([from]) => url.pathname.startsWith(from))
	if (route) return route[1] + url.pathname.slice(route[0].length)
	return url.pathname
}) satisfies Reroute

export const transport = {
	PlainDate: {
		encode: (value) => value instanceof Temporal.PlainDate && [value.toString()],
		decode: (value) => Temporal.PlainDate.from(value[0]),
	},
	ZonedDateTime: {
		encode: (value) => value instanceof Temporal.ZonedDateTime && [value.toString()],
		decode: (value) => Temporal.ZonedDateTime.from(value[0]),
	},
} satisfies Transport
