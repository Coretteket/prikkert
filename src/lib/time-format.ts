import type { InferSelectModel } from 'drizzle-orm'

import type { schema } from '@/server/db'

import { PlainDate, PlainDateTime } from '@/temporal'

export const formatOptions = {
	date: {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	},
	shortDate: {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	},
	time: {
		hour: '2-digit',
		minute: '2-digit',
	},
} satisfies Record<string, Intl.DateTimeFormatOptions>

export function formatDateTimeOption({
	startsAt,
	endsAt,
}: Pick<InferSelectModel<typeof schema.options>, 'startsAt' | 'endsAt'>): string {
	const date = startsAt.toLocaleString('nl', formatOptions.date)
	if (startsAt instanceof PlainDate) return date

	const timeStart = startsAt.toLocaleString('nl', formatOptions.time)
	if (!endsAt || startsAt.equals(endsAt)) return `${date}, ${timeStart}`

	const timeEnd = endsAt.toLocaleString('nl', formatOptions.time)
	return `${date}, ${timeStart} – ${timeEnd}`
}

export function formatDateTimeRange(
	startsAt: PlainDate | PlainDateTime,
	endsAt: PlainDate | PlainDateTime,
) {
	const start = startsAt.toLocaleString('nl', formatOptions.shortDate)
	const end = endsAt.toLocaleString('nl', formatOptions.shortDate)

	if (start === end) return start

	const [startWords, endWords] = [start, end].map((d) => d.split(' ').toReversed())
	const commonCount = startWords.findIndex((w, index) => w !== endWords[index])
	const trimmedStart = startWords.slice(commonCount).toReversed().join(' ')

	return `${trimmedStart} t/m ${end}`
}
