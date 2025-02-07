import {
	pgTable,
	text,
	boolean,
	pgEnum,
	primaryKey,
	type ReferenceConfig,
} from 'drizzle-orm/pg-core'
import { instant, char16, nanoid, createdAt, datetime } from './types'
import { relations } from 'drizzle-orm'

/* UTILITIES */

const CASCADE = { onUpdate: 'cascade', onDelete: 'cascade' } satisfies ReferenceConfig['actions']

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
		.references(() => users.id, CASCADE)
		.notNull(),
	expiresAt: instant('expires_at').notNull(),
	createdAt: createdAt(),
})

export const events = pgTable('events', {
	id: nanoid(),
	ownerId: char16('owner_id')
		.references(() => users.id, CASCADE)
		.notNull(),
	title: text().notNull(),
	description: text(),
	location: text(),
	createdAt: createdAt(),
})

export const eventOptions = pgTable('event_options', {
	id: nanoid(),
	eventId: char16('event_id')
		.references(() => events.id, CASCADE)
		.notNull(),
	startsAt: datetime('starts_at').notNull(),
	endsAt: datetime('ends_at'),
	isSelected: boolean('is_selected').notNull().default(false),
})

export const responseEnum = pgEnum('response', ['YES', 'NO', 'MAYBE'])

export const eventResponses = pgTable(
	'event_responses',
	{
		optionId: char16('option_id')
			.references(() => eventOptions.id, CASCADE)
			.notNull(),
		userId: char16('user_id')
			.references(() => users.id, CASCADE)
			.notNull(),
		choice: responseEnum().notNull(),
	},
	(t) => [{ pk: primaryKey({ columns: [t.optionId, t.userId] }) }],
)

/* RELATIONS */

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	events: many(events),
	responses: many(eventResponses),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
	owner: one(users, { fields: [events.ownerId], references: [users.id] }),
	options: many(eventOptions),
}))

export const eventsOptionsRelations = relations(eventOptions, ({ one, many }) => ({
	event: one(events, { fields: [eventOptions.eventId], references: [events.id] }),
	responses: many(eventResponses),
}))

export const eventResponsesRelations = relations(eventResponses, ({ one }) => ({
	option: one(eventOptions, {
		fields: [eventResponses.optionId],
		references: [eventOptions.id],
	}),
	user: one(users, { fields: [eventResponses.userId], references: [users.id] }),
}))
