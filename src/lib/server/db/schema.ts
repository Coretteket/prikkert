// For a graphical overview, see:
// https://dbdiagram.io/d/Prikkert-67a699e4263d6cf9a06ff8ed

import {
	pgTable,
	char,
	text,
	boolean,
	pgEnum,
	primaryKey,
	type ReferenceConfig,
} from 'drizzle-orm/pg-core'
import { instant, datetime } from './types'
import { relations, sql } from 'drizzle-orm'

/* UTILITIES */

const CASCADE = { onUpdate: 'cascade', onDelete: 'cascade' } satisfies ReferenceConfig['actions']

/* SCHEMAS */

export const events = pgTable('events', {
	id: char({ length: 12 })
		.default(sql`generate_nanoid(12)`)
		.primaryKey(),

	title: text().notNull(),
	description: text(),
	location: text(),
	createdAt: instant('created_at').defaultNow().notNull(),
	expiresAt: instant('expires_at').notNull(),
})

export const options = pgTable('options', {
	id: char({ length: 12 })
		.default(sql`generate_nanoid(12)`)
		.primaryKey(),
	eventId: char('event_id', { length: 12 })
		.references(() => events.id, CASCADE)
		.notNull(),
	startsAt: datetime('starts_at').notNull(),
	endsAt: datetime('ends_at'),
	isSelected: boolean('is_selected').notNull().default(false),
})

export const sessions = pgTable('sessions', {
	id: char({ length: 12 })
		.default(sql`generate_nanoid(12)`)
		.primaryKey(),
	eventId: char({ length: 12 })
		.references(() => events.id, CASCADE)
		.notNull(),
	token: char({ length: 44 }).notNull(),
	name: text(),
	createdAt: instant('created_at').defaultNow().notNull(),
})

export const organizers = pgTable(
	'organizers',
	{
		eventId: char('event_id', { length: 12 })
			.references(() => events.id, CASCADE)
			.notNull(),
		sessionId: char('session_id', { length: 12 })
			.references(() => sessions.id, CASCADE)
			.notNull(),
	},
	(t) => [{ pk: primaryKey({ columns: [t.eventId, t.sessionId] }) }],
)

export const availability = pgEnum('availability', ['YES', 'NO', 'MAYBE'])

export const responses = pgTable(
	'responses',
	{
		optionId: char('option_id', { length: 12 })
			.references(() => options.id, CASCADE)
			.notNull(),
		sessionId: char('session_id', { length: 12 })
			.references(() => sessions.id, CASCADE)
			.notNull(),
		availability: availability().notNull(),
		note: text(),
	},
	(t) => [{ pk: primaryKey({ columns: [t.optionId, t.sessionId] }) }],
)

/* RELATIONS */

export const eventsRelations = relations(events, ({ one, many }) => ({
	organizer: one(organizers, { fields: [events.id], references: [organizers.eventId] }),
	options: many(options),
	sessions: many(sessions)
}))

export const optionsRelations = relations(options, ({ one, many }) => ({
	event: one(events, { fields: [options.eventId], references: [events.id] }),
	responses: many(responses),
}))

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
	event: one(events, { fields: [sessions.eventId], references: [events.id] }),
	responses: many(responses),
}))

export const organizersRelations = relations(organizers, ({ one }) => ({
	event: one(events, { fields: [organizers.eventId], references: [events.id] }),
	session: one(sessions, { fields: [organizers.sessionId], references: [sessions.id] }),
}))

export const responsesRelations = relations(responses, ({ one }) => ({
	option: one(options, { fields: [responses.optionId], references: [options.id] }),
	session: one(sessions, { fields: [responses.sessionId], references: [sessions.id] }),
}))
