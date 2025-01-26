import { pgTable, text, boolean } from 'drizzle-orm/pg-core'
import { instant, char16, nanoid, createdAt } from './types'
import { relations } from 'drizzle-orm'

/* SCHEMAS */

export const users = pgTable('users', {
	id: nanoid(),
	name: text(),
	email: text().unique(),
	passwordHash: text('password_hash'),
	createdAt: createdAt(),
})

export const sessions = pgTable('sessions', {
	id: text().primaryKey(),
	userId: char16('user_id')
		.references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' })
		.notNull(),
	expiresAt: instant('expires_at').notNull(),
	createdAt: createdAt(),
})

export const events = pgTable('events', {
	id: nanoid(),
	ownerId: char16('owner_id')
		.references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' })
		.notNull(),
	title: text().notNull(),
	description: text(),
	location: text(),
	isPlainDate: boolean('is_plain_date').notNull().default(true),
	createdAt: createdAt(),
})

export const eventOptions = pgTable('event_options', {
	eventId: char16('event_id')
		.references(() => events.id, { onUpdate: 'cascade', onDelete: 'cascade' })
		.notNull(),
	startsAt: instant('starts_at').notNull(),
	endsAt: instant('ends_at'),
	isChosen: boolean('is_chosen').notNull().default(false),
})

/* RELATIONS */

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	events: many(events),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
	owner: one(users, { fields: [events.ownerId], references: [users.id] }),
	options: many(eventOptions),
}))

export const eventsOptionsRelations = relations(eventOptions, ({ one }) => ({
	event: one(events, { fields: [eventOptions.eventId], references: [events.id] }),
}))
