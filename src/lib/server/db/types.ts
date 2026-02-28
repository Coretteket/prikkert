import { customType, type PgTimestampConfig, timestamp } from 'drizzle-orm/pg-core'
import { Temporal } from 'temporal-polyfill'

/** Instant with timezone compatible with Temporal API. */
export const instant = (name?: string) => {
	const params = { withTimezone: true, mode: 'string' } satisfies PgTimestampConfig
	return name ? timestamp(name, params) : timestamp(params)
}

/** Zoned datetime or plain date compatible with Temporal API. */
export const datetime = customType<{
	data: Temporal.ZonedDateTime | Temporal.PlainDate
	driverData: string
}>({
	dataType: () => 'text',
	toDriver: (value) => value.toString(),
	fromDriver: (value) => {
		if (value.includes('[')) return Temporal.ZonedDateTime.from(value)
		return Temporal.PlainDate.from(value)
	},
})
