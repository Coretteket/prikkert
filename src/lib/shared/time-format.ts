import type { InferSelectModel } from 'drizzle-orm'

import { page } from '$app/state'

import type { schema } from '@/server/db'

import { Temporal } from '@/shared/temporal'

export const formatOptions = {
	date: {
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
}: Pick<InferSelectModel<typeof schema.options>, 'startsAt' | 'endsAt'>) {
	const weekday = startsAt.toLocaleString(page.data.locale, { weekday: 'long' })
	const date = startsAt.toLocaleString(page.data.locale, formatOptions.date)
	if (startsAt instanceof Temporal.PlainDate) return { weekday, date }

	const timeStart = startsAt.toLocaleString(page.data.locale, formatOptions.time)
	if (!endsAt || startsAt.equals(endsAt)) return { weekday, date, time: timeStart }

	const timeEnd = endsAt.toLocaleString(page.data.locale, formatOptions.time)
	return { weekday, date, time: `${timeStart} - ${timeEnd}` }
}

export function formatDateTimeRange(
	startsAt: Temporal.PlainDate | Temporal.PlainDateTime,
	endsAt: Temporal.PlainDate | Temporal.PlainDateTime,
) {
	const start = startsAt.toLocaleString(page.data.locale, formatOptions.date)
	const end = endsAt.toLocaleString(page.data.locale, formatOptions.date)

	if (start === end) return start

	const [startWords, endWords] = [start, end].map((d) => d.split(' ').toReversed())
	const commonCount = startWords.findIndex((w, index) => w !== endWords[index])
	const trimmedStart = startWords.slice(commonCount).toReversed().join(' ')

	const joiner = /* @wc-include */ 't/m'
	return [trimmedStart.replace(/,$/, ''), joiner, end].join(' ')
}
