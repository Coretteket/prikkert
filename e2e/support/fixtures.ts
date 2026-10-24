import { test as base } from '@playwright/test'

import {
	organizerCookie,
	removeSeededEvent,
	seedEvent,
	type SeededEvent,
	type SeedEventDetails,
} from './database'
import { createEvent, eventTitle, removeEvent, type EventDetails } from './events'

type CreatedEvent = {
	id: string
	remove: () => Promise<void>
	title: string
}

type CreateEvent = (details?: Partial<EventDetails>) => Promise<CreatedEvent>
type SeedEvent = (
	details?: SeedEventDetails & { authenticateOrganizer?: boolean },
) => Promise<SeededEvent>

export const test = base.extend<{ createEvent: CreateEvent; seedEvent: SeedEvent }>({
	// use this when creating the event through the UI is part of the test
	createEvent: async ({ page }, use) => {
		const eventIds = new Set<string>()

		await use(async (details = {}) => {
			const title = details.title ?? eventTitle()
			const id = await createEvent(page, { ...details, title })
			eventIds.add(id)

			return {
				id,
				title,
				remove: async () => {
					await removeEvent(page, id)
					eventIds.delete(id)
				},
			}
		})

		for (const id of eventIds) await removeSeededEvent(id)
	},
	// use this when the test only needs an event as quick database setup
	seedEvent: async ({ context }, use) => {
		const eventIds = new Set<string>()

		await use(async ({ authenticateOrganizer = true, ...details } = {}) => {
			const event = await seedEvent(details)
			eventIds.add(event.id)

			if (authenticateOrganizer) {
				await context.addCookies([
					{
						...organizerCookie(event),
						expires: Math.floor(Date.now() / 1000) + 86_400,
						httpOnly: true,
						sameSite: 'Lax',
						url: 'http://127.0.0.1:4173',
					},
				])
			}

			return event
		})

		for (const id of eventIds) await removeSeededEvent(id)
	},
})

export { expect } from '@playwright/test'
