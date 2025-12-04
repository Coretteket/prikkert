import type { Transport } from '@sveltejs/kit'

export const transport = {
	PlainDate: {
		encode: (value) => value instanceof Temporal.PlainDate && [value.toString()],
		decode: (value) => Temporal.PlainDate.from(value[0]),
	},
	PlainDateTime: {
		encode: (value) => value instanceof Temporal.PlainDateTime && [value.toString()],
		decode: (value) => Temporal.PlainDateTime.from(value[0]),
	},
} satisfies Transport
