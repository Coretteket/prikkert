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

/** Convert a ZonedDateTime to the user's timezone. PlainDate is returned as-is. */
const toUserTimezone = (value: Temporal.ZonedDateTime | Temporal.PlainDate) =>
	value instanceof Temporal.ZonedDateTime ? value.withTimeZone(page.data.timezone) : value

export function formatDateTimeOption({
	startsAt,
	endsAt,
}: Pick<InferSelectModel<typeof schema.options>, 'startsAt' | 'endsAt'>) {
	const userStart = toUserTimezone(startsAt)

	const weekday = userStart.toLocaleString(page.data.locale, { weekday: 'long' })
	const date = userStart.toLocaleString(page.data.locale, formatOptions.date)
	if (userStart instanceof Temporal.PlainDate) return { weekday, date }

	const timeStart = userStart.toLocaleString(page.data.locale, formatOptions.time)
	if (!endsAt) return { weekday, date, time: timeStart }

	const userEnd = toUserTimezone(endsAt)
	if (userEnd instanceof Temporal.ZonedDateTime && userStart.equals(userEnd))
		return { weekday, date, time: timeStart }

	const timeEnd = userEnd.toLocaleString(page.data.locale, formatOptions.time)
	return { weekday, date, time: `${timeStart} - ${timeEnd}` }
}

export function formatDateTimeRange(
	startsAt: Temporal.PlainDate | Temporal.ZonedDateTime,
	endsAt: Temporal.PlainDate | Temporal.ZonedDateTime,
) {
	const userStart = toUserTimezone(startsAt)
	const userEnd = toUserTimezone(endsAt)

	const start = userStart.toLocaleString(page.data.locale, formatOptions.date)
	const end = userEnd.toLocaleString(page.data.locale, formatOptions.date)

	if (start === end) return start

	const [startWords, endWords] = [start, end].map((d) => d.split(' ').toReversed())
	const commonCount = startWords.findIndex((w, index) => w !== endWords[index])
	const trimmedStart = startWords.slice(commonCount).toReversed().join(' ')

	const joiner = /* @wc-include */ 't/m'
	return [trimmedStart.replace(/,$/, ''), joiner, end].join(' ')
}
