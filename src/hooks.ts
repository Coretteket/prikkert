import type { Transport } from '@sveltejs/kit'

import { PlainDate, PlainDateTime } from '@/temporal'

export const transport = {
	PlainDate: {
		encode: (value) => value instanceof PlainDate && [value.toString()],
		decode: (value) => PlainDate.from(value[0]),
	},
	PlainDateTime: {
		encode: (value) => value instanceof PlainDateTime && [value.toString()],
		decode: (value) => PlainDateTime.from(value[0]),
	},
} satisfies Transport
