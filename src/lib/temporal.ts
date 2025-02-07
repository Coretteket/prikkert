import { Temporal } from 'temporal-polyfill'

export const { Now, Instant, PlainDate, PlainDateTime, PlainTime, Duration } = Temporal

const formatOptions = {
	date: {
		weekday: 'short',
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
}: {
	startsAt: PlainDate | PlainDateTime
	endsAt: PlainDate | PlainDateTime | null
}) {
	const date = startsAt.toLocaleString('nl', formatOptions.date)
	if (startsAt instanceof PlainDate) return date

	const timeStart = startsAt.toLocaleString('nl', formatOptions.time)
	if (!endsAt) return `${date}, ${timeStart}`

	const timeEnd = endsAt.toLocaleString('nl', formatOptions.time)
	return `${date}, ${timeStart} - ${timeEnd}`
}

export type Instant = InstanceType<typeof Temporal.Instant>
export type PlainDateTime = InstanceType<typeof Temporal.PlainDateTime>
export type PlainDate = InstanceType<typeof Temporal.PlainDate>
export type PlainTime = InstanceType<typeof Temporal.PlainTime>
export type Duration = InstanceType<typeof Temporal.Duration>
