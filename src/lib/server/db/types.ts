import { Temporal } from 'temporal-polyfill'
import { sql } from 'drizzle-orm'
import {
	char,
	customType,
	timestamp,
	type PgCharConfig,
	type PgTimestampConfig,
} from 'drizzle-orm/pg-core'

/** Char of length 16 (for storing NanoIDs). */
export const char16 = (name?: string) => {
	const params = { length: 16 } satisfies PgCharConfig
	return name ? char(name, params) : char(params)
}

/** Primary key generated as NanoID of length 16. */
export const nanoid = (name?: string) =>
	char16(name)
		.default(sql`generate_nanoid(16)`)
		.primaryKey()

/** Timestamp with timezone compatible with Temporal API. */
export const instant = (name?: string) => {
	const params = { withTimezone: true, mode: 'string' } satisfies PgTimestampConfig
	return name ? timestamp(name, params) : timestamp(params)
}

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

/** Created at timestamp. */
export const createdAt = () =>
	instant('created_at')
		.default(sql`now()`)
		.notNull()
