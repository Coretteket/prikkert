import { getPersistedOptions, removeSeededEvent } from './support/database.ts'
import { eventTitle, submitResponse } from './support/events.ts'
import { expect, test } from './support/fixtures.ts'
import { newSession } from './support/sessions.ts'

test('validates the required event fields', async ({ page }) => {
	await page.goto('/afspraak/aanmaken')
	await page.getByLabel('Titel').fill('ab')
	await page.getByRole('button', { name: 'Afspraak aanmaken' }).click()

	await expect(page.getByText('Vul een titel in van minstens 3 tekens.')).toBeVisible()
	await expect(page.getByText('Selecteer minstens 1 datum.')).toBeVisible()
})

test('creates an event with details and privacy settings', async ({
	browser,
	createEvent,
	page,
}) => {
	const description = 'We bespreken de planning voor volgende maand.'
	const event = await createEvent({
		allowAnonymous: true,
		description,
		hideResponses: true,
		organizerName: 'Olivia',
	})

	await expect(page.getByText(description)).toBeVisible()
	await expect(page.getByText('Nog niemand heeft gereageerd.')).toBeVisible()
	await expect(
		page.getByText('Reacties zijn standaard alleen zichtbaar op dit apparaat.'),
	).toBeVisible()

	const visitor = await newSession(browser)
	try {
		await visitor.page.goto(`/${event.id}`)
		await expect(visitor.page).toHaveURL(`/afspraak/reageren/${event.id}`)
		await expect(visitor.page.getByText('(optioneel)')).toBeVisible()

		await submitResponse(visitor.page, {})
		await expect(visitor.page.getByText('Je hebt gereageerd op deze afspraak')).toBeVisible()

		await page.goto(`/afspraak/overzicht/${event.id}`)
		await page.getByRole('button', { name: 'Toon alle reacties' }).click()
		await expect(page.getByText('Anonieme deelnemer').first()).toBeVisible()
	} finally {
		await visitor.context.close()
	}

	await page.goto('/afspraken')
	await expect(page.getByRole('heading', { level: 2, name: event.title })).toBeVisible()
})

test('supports keyboard date selection', async ({ page }) => {
	await page.goto('/afspraak/aanmaken')

	const date = page.locator('button[data-date][tabindex="0"]')
	const initialDate = await date.getAttribute('data-date')
	await date.focus()
	await page.keyboard.press('ArrowRight')

	const nextDate = page.locator('button[data-date]:focus')
	await expect(nextDate).not.toHaveAttribute('data-date', initialDate ?? '')
	await page.keyboard.press('Space')
	await expect(nextDate).toHaveAttribute('aria-pressed', 'true')
})

test('normalizes compact times and validates their order', async ({ page }) => {
	await page.goto('/afspraak/aanmaken')
	await page.getByLabel('Titel').fill('Avondwandeling')
	await page.locator('button[data-date]:not(:disabled)').first().click()
	await page.getByRole('button', { name: 'Datumopties aanpassen' }).click()
	await page.getByRole('button', { name: 'Tijden toevoegen' }).click()

	const times = page.getByPlaceholder('00:00')
	await times.nth(0).fill('1800')
	await times.nth(0).blur()
	await times.nth(1).fill('1700')
	await times.nth(1).blur()
	await expect(times.nth(0)).toHaveValue('18:00')
	await expect(times.nth(1)).toHaveValue('17:00')

	await page.getByRole('button', { name: 'Afspraak aanmaken' }).click()
	await expect(page.getByText('Vul een starttijd in die eerder is dan de eindtijd.')).toBeVisible()
})

test('copies date options to every selected date', async ({ page }) => {
	await page.goto('/afspraak/aanmaken')
	const dates = page.locator('button[data-date]:not(:disabled)')
	await dates.nth(0).click()
	await dates.nth(1).click()
	await page.getByRole('button', { name: 'Datumopties aanpassen' }).click()
	await page.getByRole('button', { name: 'Tijden toevoegen' }).first().click()
	await page.getByPlaceholder('00:00').nth(0).fill('1330')
	await page.getByPlaceholder('00:00').nth(0).blur()
	await page.getByPlaceholder('Vul een opmerking in...').first().fill('Na de lunch')

	await page.getByRole('button', { name: 'Kopiëren naar alle datums' }).click()

	await expect(page.getByPlaceholder('00:00')).toHaveCount(4)
	await expect(page.getByPlaceholder('00:00').nth(2)).toHaveValue('13:30')
	await expect(page.getByPlaceholder('Vul een opmerking in...').nth(1)).toHaveValue('Na de lunch')
})

test('persists a timed option with an end date and note', async ({ page }) => {
	const title = eventTitle('Weekend weg')
	await page.goto('/afspraak/aanmaken')
	await page.getByLabel('Titel').fill(title)
	const startDateButton = page.locator('button[data-date]:not(:disabled)').first()
	const startDate = await startDateButton.getAttribute('data-date')
	await startDateButton.click()
	await page.getByRole('button', { name: 'Datumopties aanpassen' }).click()
	await page.getByRole('button', { name: 'Tijden toevoegen' }).click()
	const times = page.getByPlaceholder('00:00')
	await times.nth(0).fill('0900')
	await times.nth(0).blur()
	await times.nth(1).fill('1030')
	await times.nth(1).blur()
	await page.getByPlaceholder('Vul een opmerking in...').fill('Gezamenlijk ontbijt')
	await page.getByRole('button', { name: 'Einddatum toevoegen' }).click()
	const dialog = page.getByRole('dialog')
	const endDateButton = dialog.locator('button[data-date]:not(:disabled)').first()
	const endDate = await endDateButton.getAttribute('data-date')
	await endDateButton.click()
	await dialog.getByRole('button', { name: 'Bevestigen' }).click()

	await page.getByRole('button', { name: 'Afspraak aanmaken' }).click()
	await expect(page).toHaveURL(/\/afspraak\/overzicht\/[\w-]+$/)
	const eventId = page.url().split('/').at(-1)!

	try {
		await expect(page.getByText('Gezamenlijk ontbijt')).toBeVisible()
		await expect(page.getByRole('time').filter({ hasText: '09:00' })).toContainText('10:30')

		const [option] = await getPersistedOptions(eventId)
		expect(option.startsAt).toContain(`${startDate}T09:00`)
		expect(option.endsAt).toContain(`${endDate}T10:30`)
	} finally {
		await removeSeededEvent(eventId)
	}
})
