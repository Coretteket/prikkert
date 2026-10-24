import { eventTitle, submitResponse } from './support/events.ts'
import { expect, test } from './support/fixtures.ts'
import { newSession } from './support/sessions.ts'
import { openMenu } from './support/ui.ts'

test('edits an event', async ({ createEvent, page }) => {
	await createEvent()
	const updatedTitle = eventTitle('Teamuitje')

	const menu = await openMenu(page, 'Afspraak beheren')
	await menu.getByText('Afspraak bewerken', { exact: true }).click()
	await page.getByLabel('Titel').fill(updatedTitle)
	await page.getByRole('button', { name: 'Omschrijving toevoegen' }).click()
	await page.getByRole('textbox', { name: /^Omschrijving/ }).fill('We eten na afloop samen.')
	await page.getByRole('button', { name: 'Datumopties aanpassen' }).click()
	await page.getByPlaceholder('Vul een opmerking in...').first().fill('Bij voorkeur in de ochtend.')
	await page.getByRole('button', { name: 'Afspraak bewerken' }).click()

	await expect(page.getByRole('heading', { level: 1, name: updatedTitle })).toBeVisible()
	await expect(page.getByText('We eten na afloop samen.')).toBeVisible()
	await expect(page.getByText('Bij voorkeur in de ochtend.')).toBeVisible()
})

test('confirms and withdraws an event date', async ({ createEvent, page }) => {
	await createEvent()

	await page.getByRole('button', { name: 'Datum bevestigen' }).last().click()
	await page.getByRole('dialog').getByRole('button', { name: 'Bevestigen' }).click()
	await expect(page.getByText('Je hebt deze afspraak gepland voor')).toBeVisible()
	await expect(page.getByRole('link', { name: 'Beschikbaarheid invullen' })).toHaveCount(0)

	await page.getByRole('button', { name: 'Bevestiging intrekken' }).last().click()
	await page.getByRole('dialog').getByRole('button', { name: 'Bevestigen' }).click()
	await expect(page.getByRole('link', { name: 'Beschikbaarheid invullen' })).toBeVisible()
})

test('hands organizer access to a second browser', async ({ browser, page, seedEvent }) => {
	const event = await seedEvent()
	await page.goto(`/afspraak/overzicht/${event.id}`)
	const menu = await openMenu(page, 'Afspraak beheren')
	await menu.getByText('Afspraakbeheer delen').click()
	const shareLinkText = await page.getByRole('dialog').locator('output').textContent()
	const shareLink = shareLinkText?.trim() ?? ''
	const receiver = await newSession(browser)

	await receiver.page.goto(shareLink)
	await receiver.page.getByRole('dialog').getByRole('button', { name: 'Bevestigen' }).click()

	await expect(receiver.page.getByRole('button', { name: 'Afspraak beheren' })).toBeVisible()
	await receiver.page.goto('/afspraken')
	await expect(receiver.page.getByText(event.title)).toBeVisible()
	await receiver.context.close()
})

test('lets an organizer respond without losing management access', async ({ page, seedEvent }) => {
	const event = await seedEvent()
	await page.goto(`/afspraak/reageren/${event.id}`)

	await submitResponse(page, 'Noor')

	await expect(page.getByRole('link', { name: 'Beschikbaarheid bewerken' })).toBeVisible()
	await expect(page.getByRole('button', { name: 'Afspraak beheren' })).toBeVisible()
})

test('removes an event', async ({ browser, createEvent, page }) => {
	const event = await createEvent()

	await event.remove()

	await expect(page).toHaveURL('/afspraken')
	await expect(page.getByRole('heading', { level: 2, name: event.title })).toHaveCount(0)

	const visitor = await newSession(browser)
	try {
		const response = await visitor.page.goto(`/afspraak/overzicht/${event.id}`)
		expect(response?.status()).toBe(404)
		await expect(visitor.page.getByText('Afspraak niet gevonden')).toBeVisible()
	} finally {
		await visitor.context.close()
	}
})
