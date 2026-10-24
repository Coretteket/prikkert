import { expect, type Page } from '@playwright/test'

import { openMenu } from './ui.ts'

type Availability = 'YES' | 'MAYBE' | 'NO'

export type EventDetails = {
	allowAnonymous?: boolean
	description?: string
	hideResponses?: boolean
	organizerName?: string
	title: string
}

export function eventTitle(title = 'Teamoverleg') {
	return `${title} ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function createEvent(page: Page, details: EventDetails) {
	await page.goto('/afspraak/aanmaken')
	await page.getByLabel('Titel').fill(details.title)

	if (details.organizerName) {
		await page.getByRole('button', { name: 'Naam toevoegen' }).click()
		await page.getByRole('textbox', { name: /^Naam/ }).fill(details.organizerName)
	}

	if (details.description) {
		await page.getByRole('button', { name: 'Omschrijving toevoegen' }).click()
		await page.getByRole('textbox', { name: /^Omschrijving/ }).fill(details.description)
	}

	const availableDates = page.locator('button[data-date]:not(:disabled)')
	await availableDates.nth(0).click()
	await availableDates.nth(1).click()

	if (details.allowAnonymous || details.hideResponses) {
		await page.getByRole('button', { name: 'Privacy instellen' }).click()
		if (details.allowAnonymous) {
			await page.getByLabel('Sta deelnemers toe om anoniem te reageren').check()
		}
		if (details.hideResponses) {
			await page.getByLabel('Toon reacties van deelnemers alleen aan de organisator').check()
		}
	}

	await page.getByRole('button', { name: 'Afspraak aanmaken' }).click()
	await expect(page).toHaveURL(/\/afspraak\/overzicht\/[\w-]+$/)
	await expect(page.getByRole('heading', { level: 1, name: details.title })).toBeVisible()

	return page.url().split('/').at(-1)!
}

type ResponseDetails = {
	availabilities?: Availability[]
	name?: string
	notes?: Array<string | undefined>
}

const availabilityLabels = { YES: 'Ja', MAYBE: 'Misschien', NO: 'Nee' } as const

export async function submitResponse(page: Page, details: ResponseDetails | string) {
	const {
		availabilities = [],
		name,
		notes = [],
	} = typeof details === 'string' ? { name: details } : details

	if (name !== undefined) await page.getByRole('textbox', { name: 'Naam' }).fill(name)

	const optionFields = page.locator('fieldset')
	const optionCount = await optionFields.count()
	for (let index = 0; index < optionCount; index++) {
		const availability = availabilities[index] ?? 'YES'
		const optionField = optionFields.nth(index)
		await optionField.getByText(availabilityLabels[availability], { exact: true }).click()

		const note = notes[index]
		if (note === undefined) continue

		const option = optionFields.nth(index).locator('xpath=../../..')
		await option.getByRole('button', { name: 'Opmerking toevoegen' }).click()
		await page.getByPlaceholder('Voeg een opmerking toe...').nth(index).fill(note)
	}

	await page.getByRole('button', { name: 'Reactie opslaan' }).click()
}

export async function removeEvent(page: Page, eventId: string) {
	await page.goto(`/afspraak/overzicht/${eventId}`)
	const menu = await openMenu(page, 'Afspraak beheren')
	await menu.getByText('Afspraak verwijderen', { exact: true }).click()

	const dialog = page.getByRole('dialog')
	await expect(dialog.getByText('Afspraak verwijderen', { exact: true })).toBeVisible()
	await dialog.getByRole('button', { name: 'Verwijderen' }).click()
	await expect(page).toHaveURL('/afspraken')
}
