// For a graphical overview, see:
// https://dbdiagram.io/d/Prikkert-690e25276735e11170c6319a

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
import { relations } from 'drizzle-orm'
import { generateNanoID } from '../crypto'

/* UTILITIES */

const CASCADE = { onUpdate: 'cascade', onDelete: 'cascade' } satisfies ReferenceConfig['actions']

/* SCHEMAS */

export const events = pgTable('events', {
	id: char({ length: 16 })
		.$default(() => generateNanoID(16))
		.primaryKey(),
	title: text().notNull(),
	description: text(),
	allowAnonymous: boolean().notNull().default(false),
	hideParticipants: boolean().notNull().default(false),
	createdAt: instant().defaultNow().notNull(),
	expiresAt: instant().notNull(),
})

export const options = pgTable('options', {
	id: char({ length: 16 })
		.$default(() => generateNanoID(16))
		.primaryKey(),
	eventId: char({ length: 16 })
		.references(() => events.id, CASCADE)
		.notNull(),
	startsAt: datetime().notNull(),
	endsAt: datetime(),
	isSelected: boolean().notNull().default(false),
})

export const sessions = pgTable('sessions', {
	id: char({ length: 16 })
		.$default(() => generateNanoID(16))
		.primaryKey(),
	eventId: char({ length: 16 })
		.references(() => events.id, CASCADE)
		.notNull(),
	token: char({ length: 44 }).notNull(),
	name: text(),
	createdAt: instant().defaultNow().notNull(),
})

export const organizers = pgTable(
	'organizers',
	{
		eventId: char({ length: 16 })
			.references(() => events.id, CASCADE)
			.notNull(),
		sessionId: char({ length: 16 })
			.references(() => sessions.id, CASCADE)
			.notNull(),
	},
	(t) => [primaryKey({ columns: [t.eventId, t.sessionId] })],
)

export const availability = pgEnum('availability', ['YES', 'NO', 'MAYBE'])

export const responses = pgTable(
	'responses',
	{
		optionId: char({ length: 16 })
			.references(() => options.id, CASCADE)
			.notNull(),
		sessionId: char({ length: 16 })
			.references(() => sessions.id, CASCADE)
			.notNull(),
		availability: availability().notNull(),
		note: text(),
	},
	(t) => [primaryKey({ columns: [t.optionId, t.sessionId] })],
)

/* RELATIONS */

export const eventsRelations = relations(events, ({ one, many }) => ({
	organizer: one(organizers, { fields: [events.id], references: [organizers.eventId] }),
	options: many(options),
	sessions: many(sessions),
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
