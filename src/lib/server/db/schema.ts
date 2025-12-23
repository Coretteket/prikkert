// For a graphical overview, see:
// https://dbdiagram.io/d/Prikkert-690e25276735e11170c6319a

import {
	boolean,
	char,
	pgEnum,
	pgTable,
	primaryKey,
	type ReferenceConfig,
	text,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

import { datetime, instant } from './types'
import { generateNanoID } from '../crypto'

/* UTILITIES */

export const ID_LENGTH = 16
export const TOKEN_LENGTH = 21
export const HASHED_TOKEN_LENGTH = 44

const CASCADE = { onUpdate: 'cascade', onDelete: 'cascade' } satisfies ReferenceConfig['actions']

/* SCHEMAS */

export const events = pgTable('events', {
	id: char({ length: ID_LENGTH })
		.$default(() => generateNanoID(ID_LENGTH))
		.primaryKey(),
	title: text().notNull(),
	organizerName: text(),
	description: text(),
	allowAnonymous: boolean().notNull().default(false),
	hideResponses: boolean().notNull().default(false),
	createdAt: instant().defaultNow().notNull(),
	expiresAt: instant().notNull(),
})

export const options = pgTable('options', {
	id: char({ length: ID_LENGTH })
		.$default(() => generateNanoID(ID_LENGTH))
		.primaryKey(),
	eventId: char({ length: ID_LENGTH })
		.references(() => events.id, CASCADE)
		.notNull(),
	startsAt: datetime().notNull(),
	endsAt: datetime(),
	isSelected: boolean().notNull().default(false),
})

export const sessions = pgTable('sessions', {
	id: char({ length: ID_LENGTH })
		.$default(() => generateNanoID(ID_LENGTH))
		.primaryKey(),
	eventId: char({ length: ID_LENGTH })
		.references(() => events.id, CASCADE)
		.notNull(),
	token: char({ length: HASHED_TOKEN_LENGTH }).notNull(),
	isOrganizer: boolean().notNull().default(false),
	name: text(),
	createdAt: instant().defaultNow().notNull(),
})

export const availability = pgEnum('availability', ['YES', 'NO', 'MAYBE'])

export const responses = pgTable(
	'responses',
	{
		optionId: char({ length: ID_LENGTH })
			.references(() => options.id, CASCADE)
			.notNull(),
		sessionId: char({ length: ID_LENGTH })
			.references(() => sessions.id, CASCADE)
			.notNull(),
		availability: availability().notNull(),
		note: text(),
	},
	(t) => [primaryKey({ columns: [t.optionId, t.sessionId] })],
)

/* RELATIONS */

export const eventsRelations = relations(events, ({ many }) => ({
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

export const responsesRelations = relations(responses, ({ one }) => ({
	option: one(options, { fields: [responses.optionId], references: [options.id] }),
	session: one(sessions, { fields: [responses.sessionId], references: [sessions.id] }),
}))
