import type { Browser, BrowserContext, Page } from '@playwright/test'

import type { SeededEvent, SeededRespondent } from './database'

import { organizerCookie, respondentCookie } from './database'

type SessionOptions = {
	organizer?: SeededEvent
	respondent?: { eventId: string; respondent: SeededRespondent }
}

export async function newSession(
	browser: Browser,
	options: SessionOptions = {},
): Promise<{ context: BrowserContext; page: Page }> {
	const context = await browser.newContext({ locale: 'nl-NL' })
	const cookies = []

	if (options.organizer) cookies.push(organizerCookie(options.organizer))
	if (options.respondent)
		cookies.push(respondentCookie(options.respondent.eventId, options.respondent.respondent))

	if (cookies.length > 0) {
		await context.addCookies(
			cookies.map((cookie) => ({
				...cookie,
				expires: Math.floor(Date.now() / 1000) + 86_400,
				httpOnly: true,
				sameSite: 'Lax' as const,
				url: 'http://127.0.0.1:4173',
			})),
		)
	}

	return { context, page: await context.newPage() }
}
