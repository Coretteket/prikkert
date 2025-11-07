import { PlainDate, PlainDateTime } from './temporal'

const formatOptions = {
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
