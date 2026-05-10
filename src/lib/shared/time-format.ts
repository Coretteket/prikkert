import { page } from '$app/state'

import { toUserTimezone } from '@/shared/timezone'
import { toPreciseLocale } from '@/shared/utils'
import { Temporal } from '@/shared/temporal'

type DateLabel = { weekday: string; date: string; time?: string }
type DateRangeLabel = { kind: 'range'; start: DateLabel; end: DateLabel }
type DateSingleLabel = { kind: 'single' } & DateLabel
type DateOptionLabel = DateSingleLabel | DateRangeLabel

export function formatDate(
	start: Temporal.ZonedDateTime | Temporal.PlainDate,
	end?: Temporal.ZonedDateTime | Temporal.PlainDate,
): DateOptionLabel {
	const userStart = toUserTimezone(start)

	const weekday = formatWeekday(userStart)
	const userEnd = end ? toUserTimezone(end) : undefined

	if (!userEnd)
		return {
			kind: 'single',
			weekday,
			date: formatPlainDate(userStart),
			time: formatPlainTime(userStart),
		}

	const startDate =
		userStart instanceof Temporal.ZonedDateTime ? userStart.toPlainDate() : userStart

	const endDate = userEnd instanceof Temporal.ZonedDateTime ? userEnd.toPlainDate() : userEnd
	const endShowsYear = shouldShowYear(endDate)

	if (Temporal.PlainDate.compare(startDate, endDate) === 0) {
		if (userStart instanceof Temporal.ZonedDateTime)
			return userStart.equals(userEnd)
				? {
						kind: 'single',
						weekday,
						date: formatPlainDate(startDate),
						time: formatPlainTime(userStart),
					}
				: {
						kind: 'single',
						weekday,
						date: formatPlainDate(startDate),
						time: `${formatPlainTime(userStart)} – ${formatPlainTime(userEnd)}`,
					}

		return {
			kind: 'single',
			weekday,
			date: formatPlainDate(startDate),
		}
	}

	return {
		kind: 'range',
		start: {
			weekday,
			date: formatPlainDate(startDate, endShowsYear),
			time: formatPlainTime(userStart),
		},
		end: {
			weekday: formatWeekday(userEnd),
			date: formatPlainDate(endDate, endShowsYear),
			time: formatPlainTime(userEnd),
		},
	}
}

function locale() {
	return toPreciseLocale(page.data.locale)
}

function formatWeekday(date: Temporal.PlainDate | Temporal.ZonedDateTime) {
	return date.toLocaleString(locale(), { weekday: 'long' })
}

function shouldShowYear(date: Temporal.PlainDate) {
	const now = Temporal.Now.plainDateISO(page.data.timezone)
	return Temporal.PlainDate.compare(date, now.add({ years: 1 })) > 0
}

function formatPlainDate(date: Temporal.PlainDate | Temporal.ZonedDateTime, forceYear = false) {
	const plainDate = date instanceof Temporal.ZonedDateTime ? date.toPlainDate() : date
	return plainDate.toLocaleString(locale(), {
		day: 'numeric',
		month: 'long',
		year: forceYear || shouldShowYear(plainDate) ? 'numeric' : undefined,
	})
}

function formatPlainTime(date: Temporal.PlainDate | Temporal.ZonedDateTime) {
	return date instanceof Temporal.ZonedDateTime
		? date.toLocaleString(locale(), { hour: '2-digit', minute: '2-digit' })
		: undefined
}
