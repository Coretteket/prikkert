import type { Browser } from '@playwright/test'

import { submitResponse } from './support/events.ts'
import { expect, test } from './support/fixtures.ts'
import { futureDate } from './support/database.ts'
import { newSession } from './support/sessions.ts'

async function openResponsePage(browser: Browser, eventId: string) {
	const session = await newSession(browser)
	await session.page.goto(`/${eventId}`)
	await session.page.getByRole('link', { name: 'Beschikbaarheid invullen' }).click()
	return session
}

test('validates a participant response', async ({ browser, seedEvent }) => {
	const event = await seedEvent({ authenticateOrganizer: false })
	const participant = await openResponsePage(browser, event.id)

	await participant.page.getByRole('button', { name: 'Reactie opslaan' }).click()

	await expect(participant.page.getByText('Vul je naam in.')).toBeVisible()
	await expect(
		participant.page.getByText('Vul je beschikbaarheid in voor alle opties.'),
	).toBeVisible()
	await participant.context.close()
})

test('submits and updates a participant response', async ({ browser, page, seedEvent }) => {
	const event = await seedEvent({ organizerName: 'Olivia' })
	const participant = await openResponsePage(browser, event.id)

	await submitResponse(participant.page, 'Pieter')
	await expect(participant.page).toHaveURL(`/afspraak/overzicht/${event.id}`)

	await participant.page.getByRole('link', { name: 'Beschikbaarheid bewerken' }).click()
	await participant.page.getByText('Misschien', { exact: true }).last().click()
	await participant.page.getByRole('button', { name: 'Reactie opslaan' }).click()
	await expect(participant.page).toHaveURL(`/afspraak/overzicht/${event.id}`)

	await page.goto(`/afspraak/overzicht/${event.id}`)
	await page.getByRole('button', { name: 'Toon alle reacties' }).click()
	await expect(page.getByText('Pieter').first()).toBeVisible()
	await expect(page.getByTitle('Misschien')).toHaveCount(1)
	await participant.context.close()
})

test('saves every availability value and participant notes', async ({
	browser,
	page,
	seedEvent,
}) => {
	const event = await seedEvent({
		options: [
			{ startsAt: futureDate(30) },
			{ startsAt: futureDate(31) },
			{ startsAt: futureDate(32) },
		],
	})
	const participant = await newSession(browser)
	await participant.page.goto(`/afspraak/reageren/${event.id}`)

	await submitResponse(participant.page, {
		availabilities: ['YES', 'MAYBE', 'NO'],
		name: 'Ravi',
		notes: ['Hele dag', 'Alleen in de avond', 'Ben op reis'],
	})

	await participant.page.getByRole('link', { name: 'Beschikbaarheid bewerken' }).click()
	const fields = participant.page.locator('fieldset')
	await expect(fields.nth(0).getByRole('radio', { name: 'Ja' })).toBeChecked()
	await expect(fields.nth(1).getByRole('radio', { name: 'Misschien' })).toBeChecked()
	await expect(fields.nth(2).getByRole('radio', { name: 'Nee' })).toBeChecked()

	await page.goto(`/afspraak/overzicht/${event.id}`)
	await page.getByRole('button', { name: 'Toon alle reacties' }).click()
	await expect(page.getByText('Hele dag')).toBeVisible()
	await expect(page.getByText('Alleen in de avond')).toBeVisible()
	await expect(page.getByText('Ben op reis')).toBeVisible()
	await participant.context.close()
})

test('removes a previously saved participant note', async ({ browser, seedEvent }) => {
	const event = await seedEvent({ authenticateOrganizer: false })
	const participant = await newSession(browser)
	await participant.page.goto(`/afspraak/reageren/${event.id}`)
	await submitResponse(participant.page, { name: 'Noa', notes: ['Neem de trein'] })

	await participant.page.getByRole('link', { name: 'Beschikbaarheid bewerken' }).click()
	await participant.page.getByRole('button', { name: 'Opmerking verwijderen' }).first().click()
	await participant.page.getByRole('button', { name: 'Reactie opslaan' }).click()
	await participant.page.getByRole('link', { name: 'Beschikbaarheid bewerken' }).click()

	await expect(
		participant.page.getByRole('button', { name: 'Opmerking toevoegen' }).first(),
	).toBeVisible()
	await expect(participant.page.getByText('Neem de trein')).toHaveCount(0)
	await participant.context.close()
})

test('removes a participant response', async ({ browser, page, seedEvent }) => {
	const event = await seedEvent()
	const participant = await openResponsePage(browser, event.id)
	await submitResponse(participant.page, 'Pieter')
	await participant.page.getByRole('link', { name: 'Beschikbaarheid bewerken' }).click()

	await participant.page.getByRole('button', { name: 'Reactie verwijderen' }).click()
	await participant.page.getByRole('dialog').getByRole('button', { name: 'Verwijderen' }).click()

	await expect(participant.page.getByRole('button', { name: 'Reactie opslaan' })).toBeVisible()

	await page.goto(`/afspraak/overzicht/${event.id}`)
	await expect(page.getByText('Pieter')).toHaveCount(0)
	await expect(page.getByText('Nog niemand heeft gereageerd.')).toBeVisible()
	await participant.context.close()
})

test('allows an anonymous response only when configured', async ({ browser, page, seedEvent }) => {
	const event = await seedEvent({ allowAnonymous: true })
	const participant = await newSession(browser)
	await participant.page.goto(`/afspraak/reageren/${event.id}`)
	await submitResponse(participant.page, {})

	await page.goto(`/afspraak/overzicht/${event.id}`)
	await page.getByRole('button', { name: 'Toon alle reacties' }).click()
	await expect(page.getByText('Anonieme deelnemer').first()).toBeVisible()
	await participant.context.close()
})
