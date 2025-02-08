import { Temporal } from 'temporal-polyfill'
import { customType, timestamp, type PgTimestampConfig } from 'drizzle-orm/pg-core'

/** Instant with timezone compatible with Temporal API. */
export const instant = (name?: string) => {
	const params = { withTimezone: true, mode: 'string' } satisfies PgTimestampConfig
	return name ? timestamp(name, params) : timestamp(params)
}

/** Plain date or datetime compatible with Temporal API. */
export const datetime = customType<{
	data: Temporal.PlainDateTime | Temporal.PlainDate
	driverData: string
}>({
	dataType: () => 'text',
	toDriver: (value) => value.toString(),
	fromDriver: (value) => {
		if (value.includes('T')) return Temporal.PlainDateTime.from(value)
		return Temporal.PlainDate.from(value)
	},
})
