import type { InferSelectModel } from 'drizzle-orm'

import type { schema } from '@/server/db'

import { DEFAULT_TIMEZONE } from '@/shared/timezone'
import { Temporal } from '@/shared/temporal'
import { deduplicate } from '@/shared/utils'

export const toInstant = (value: Temporal.ZonedDateTime | Temporal.PlainDate) =>
	value instanceof Temporal.ZonedDateTime
		? value.toInstant()
		: value.toZonedDateTime(DEFAULT_TIMEZONE).toInstant()

export const getExpiryDate = (
	options: Pick<InferSelectModel<typeof schema.options>, 'startsAt' | 'endsAt'>[],
) => {
	let latestInstant = Temporal.Now.instant()

	for (const option of options) {
		const instant = toInstant(option.endsAt ?? option.startsAt)
		if (Temporal.Instant.compare(instant, latestInstant) > 0) latestInstant = instant
	}

	return latestInstant.toZonedDateTimeISO(DEFAULT_TIMEZONE).add({ days: 90 }).toInstant().toString()
}

export const getOptionKey = (
	option: Pick<InferSelectModel<typeof schema.options>, 'startsAt' | 'endsAt'>,
) => `${option.startsAt.toString()}:::${option.endsAt?.toString() ?? 'null'}`

type OptionSlotInput = {
	startsAt?: Temporal.PlainTime
	endsAt?: Temporal.PlainTime | null
	note?: string
}

type EventOptionsInput = Array<
	[date: Temporal.PlainDate, entry: { slots: OptionSlotInput[]; endDate?: Temporal.PlainDate }]
>

/* Builds deduplicated list of options for database insertion from the grouped form input */
export const buildEventOptions = (options: EventOptionsInput, timezone: string) =>
	deduplicate(
		options.flatMap(([date, { slots, endDate }]) =>
			slots.map((slot) => ({
				startsAt: slot.startsAt
					? date.toPlainDateTime(slot.startsAt).toZonedDateTime(timezone)
					: date,
				endsAt: endDate
					? slot.endsAt
						? endDate.toPlainDateTime(slot.endsAt).toZonedDateTime(timezone)
						: endDate
					: slot.endsAt
						? date.toPlainDateTime(slot.endsAt).toZonedDateTime(timezone)
						: null,
				note: slot.note || null,
			})),
		),
		getOptionKey,
	)

/** Extract the event timezone from a ZonedDateTime option, or undefined for PlainDate. */
export const getEventTimezone = (
	options: Array<{ startsAt: Temporal.ZonedDateTime | Temporal.PlainDate }>,
) =>
	options.find(
		(o): o is { startsAt: Temporal.ZonedDateTime } => o.startsAt instanceof Temporal.ZonedDateTime,
	)?.startsAt.timeZoneId
