import type { InferSelectModel } from 'drizzle-orm'
import type { schema } from './server/db'
import { Now, PlainDate, PlainDateTime } from './temporal'
import { date } from 'drizzle-orm/mysql-core'

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

	const [startWords, endWords] = [start, end].map((d) => d.split(' ').reverse())
	const commonCount = startWords.findIndex((w, i) => w !== endWords[i])
	const trimmedStart = startWords.slice(commonCount).reverse().join(' ')

	return `${trimmedStart} t/m ${end}`
}
