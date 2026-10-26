import { createHash } from 'node:crypto'

import { futureDate, seedRespondent } from './support/database.ts'
import { expect, test } from './support/fixtures.ts'
import { newSession } from './support/sessions.ts'

test('a visitor can open a public event and start responding', async ({ browser, seedEvent }) => {
	const event = await seedEvent({ authenticateOrganizer: false, organizerName: 'Olivia' })
	const visitor = await newSession(browser)

	await visitor.page.goto(`/${event.id}`)
	await expect(visitor.page).toHaveURL(`/afspraak/overzicht/${event.id}`)
	await expect(visitor.page.getByText('Olivia')).toBeVisible()
	await visitor.page.getByRole('link', { name: 'Beschikbaarheid invullen' }).click()
	await expect(visitor.page).toHaveURL(`/afspraak/reageren/${event.id}`)

	await visitor.context.close()
})

test('a visitor is sent straight to the form when responses are private', async ({
	browser,
	seedEvent,
}) => {
	const event = await seedEvent({ authenticateOrganizer: false, hideResponses: true })
	const visitor = await newSession(browser)

	await visitor.page.goto(`/${event.id}`)

	await expect(visitor.page).toHaveURL(`/afspraak/reageren/${event.id}`)
	await expect(visitor.page.getByRole('button', { name: 'Reactie opslaan' })).toBeVisible()
	await visitor.context.close()
})

test('only an organizer can open the edit form', async ({ browser, seedEvent }) => {
	const event = await seedEvent({ authenticateOrganizer: false })
	const visitor = await newSession(browser)

	const response = await visitor.page.goto(`/afspraak/bewerken/${event.id}`)

	expect(response?.status()).toBe(403)
	await expect(visitor.page.getByText('Niet toegestaan.')).toBeVisible()
	await visitor.context.close()
})

test('a confirmed event does not accept new responses', async ({ browser, seedEvent }) => {
	const event = await seedEvent({
		authenticateOrganizer: false,
		options: [{ isSelected: true, startsAt: futureDate(30) }, { startsAt: futureDate(31) }],
	})
	const visitor = await newSession(browser)

	await visitor.page.goto(`/afspraak/reageren/${event.id}`)

	await expect(visitor.page.getByText('Je kunt niet meer reageren.')).toBeVisible()
	await expect(visitor.page.getByRole('button', { name: 'Reactie opslaan' })).toHaveCount(0)
	await visitor.context.close()
})

test('an unknown event returns a useful 404', async ({ page }) => {
	const response = await page.goto('/afspraak/overzicht/0000000000000000')

	expect(response?.status()).toBe(404)
	await expect(page.getByText('Afspraak niet gevonden')).toBeVisible()
})

test('does not load a response with an invalid participant token', async ({
	browser,
	seedEvent,
}) => {
	const event = await seedEvent({ authenticateOrganizer: false, hideResponses: true })
	const respondent = await seedRespondent(event.id, 'Ada', [
		{ availability: 'YES', note: 'Kan de hele dag', optionId: event.options[0].id },
	])
	const visitor = await newSession(browser, {
		respondent: { eventId: event.id, respondent: { ...respondent, token: '0'.repeat(21) } },
	})

	const response = await visitor.page.goto(`/afspraak/reageren/${event.id}`)
	const html = await response?.text()

	await expect(visitor.page.getByRole('textbox', { name: 'Naam' })).toHaveValue('')
	expect(html).not.toContain('"Ada"')
	expect(html).not.toContain('Kan de hele dag')
	await visitor.context.close()
})

test('does not load a response from another event', async ({ browser, seedEvent }) => {
	const event = await seedEvent({ authenticateOrganizer: false, hideResponses: true })
	const otherEvent = await seedEvent({ authenticateOrganizer: false, hideResponses: true })
	const respondent = await seedRespondent(otherEvent.id, 'Bo', [
		{ availability: 'YES', note: 'Alleen in de avond', optionId: otherEvent.options[0].id },
	])
	const visitor = await newSession(browser, {
		respondent: { eventId: event.id, respondent },
	})

	const response = await visitor.page.goto(`/afspraak/reageren/${event.id}`)
	const html = await response?.text()

	await expect(visitor.page.getByRole('textbox', { name: 'Naam' })).toHaveValue('')
	expect(html).not.toContain('"Bo"')
	expect(html).not.toContain('Alleen in de avond')
	await visitor.context.close()
})

test('loads a private response without exposing the organizer token hash', async ({
	browser,
	seedEvent,
}) => {
	const event = await seedEvent({ authenticateOrganizer: false, hideResponses: true })
	const respondent = await seedRespondent(event.id, 'Noor', [
		{ availability: 'YES', note: 'Neem de trein', optionId: event.options[0].id },
	])
	const participant = await newSession(browser, {
		respondent: { eventId: event.id, respondent },
	})
	const organizerTokenHash = createHash('sha256').update(event.organizerToken).digest('base64')

	const response = await participant.page.goto(`/afspraak/reageren/${event.id}`)
	const html = await response?.text()

	await expect(participant.page.getByRole('textbox', { name: 'Naam' })).toHaveValue('Noor')
	expect(html).toContain('Neem de trein')
	expect(html).not.toContain('organizerToken')
	expect(html).not.toContain(organizerTokenHash)
	await participant.context.close()
})

test('hides confirmed private responses from visitors', async ({ browser, page, seedEvent }) => {
	const event = await seedEvent({
		hideResponses: true,
		options: [{ isSelected: true, startsAt: futureDate(30) }],
	})
	const respondent = await seedRespondent(event.id, 'Ravi', [
		{ availability: 'MAYBE', note: 'Ben op reis', optionId: event.options[0].id },
	])
	const visitor = await newSession(browser)
	await page.goto('/afspraken')

	// Replay the organizer's real request to test access without the page redirect.
	const [overviewResponse] = await Promise.all([
		page.waitForResponse((response) => response.url().includes('/getEventResponses?')),
		page.getByRole('link', { name: new RegExp(event.title) }).click(),
	])
	const organizerData = await overviewResponse.text()
	const response = await visitor.context.request.get(overviewResponse.url())
	const body = await response.json()

	expect(organizerData).toContain('Ravi')
	expect(organizerData).toContain('Ben op reis')
	expect(organizerData).not.toContain(respondent.id)
	expect(body.type).toBe('result')
	expect(body.data).toContain('selectedOption')
	expect(body.data).not.toContain('Ravi')
	expect(body.data).not.toContain('Ben op reis')
	expect(body.data).not.toContain('MAYBE')
	expect(body.data).not.toContain(respondent.id)
	await visitor.context.close()
})

test('loads the edit form without exposing credentials or responses', async ({
	page,
	seedEvent,
}) => {
	const event = await seedEvent({ hideResponses: true })
	const respondent = await seedRespondent(event.id, 'Noa', [
		{ availability: 'YES', note: 'Bij voorkeur in de ochtend', optionId: event.options[0].id },
	])
	const organizerTokenHash = createHash('sha256').update(event.organizerToken).digest('base64')

	const response = await page.goto(`/afspraak/bewerken/${event.id}`)
	const html = await response?.text()

	await expect(page.getByRole('textbox', { name: 'Titel' })).toHaveValue(event.title)
	expect(html).not.toContain('organizerToken')
	expect(html).not.toContain(organizerTokenHash)
	expect(html).not.toContain(respondent.id)
	expect(html).not.toContain('Bij voorkeur in de ochtend')
})

test('does not list an event with invalid session tokens', async ({ browser, seedEvent }) => {
	const event = await seedEvent({ authenticateOrganizer: false, hideResponses: true })
	const respondent = await seedRespondent(event.id, 'Alex', [])
	const visitor = await newSession(browser, {
		organizer: { ...event, organizerToken: '0'.repeat(21) },
		respondent: { eventId: event.id, respondent: { ...respondent, token: '0'.repeat(21) } },
	})

	const response = await visitor.page.goto('/afspraken')
	const html = await response?.text()

	await expect(visitor.page.getByRole('link', { name: new RegExp(event.title) })).toHaveCount(0)
	expect(html).not.toContain(event.title)
	expect(html).not.toContain(event.id)
	await visitor.context.close()
})
