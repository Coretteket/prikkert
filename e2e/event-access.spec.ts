import { expect, test } from './support/fixtures'
import { futureDate } from './support/database'
import { newSession } from './support/sessions'

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
