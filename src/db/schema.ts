import { pgTable, char, text, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

const nanoid = () => char({ length: 12 }).default(sql`generate_nanoid(12)`)

export const $users = pgTable('users', {
	id: nanoid().primaryKey(),
	name: text(),
	email: text(),
	password_hash: text(),
})

export const $sessions = pgTable('sessions', {
	id: text().primaryKey(),
	user_id: nanoid()
		.references(() => $users.id)
		.notNull(),
	expiresAt: timestamp({ withTimezone: true }).notNull(),
})
