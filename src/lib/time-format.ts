import type { InferSelectModel } from 'drizzle-orm'
import type { schema } from './server/db'
import { PlainDate } from './temporal'

export const formatOptions = {
	date: {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	},
	time: {
		hour: '2-digit',
		minute: '2-digit',
	},
} satisfies Record<string, Intl.DateTimeFormatOptions>

export function formatDateTimeRange({
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
