import { seedRespondent } from './support/database'
import { expect, test } from './support/fixtures'
import { newSession } from './support/sessions'

test('lists an organized event and its response count', async ({ page, seedEvent }) => {
	const event = await seedEvent()
	await seedRespondent(
		event.id,
		'Alex',
		event.options.map((option) => ({ availability: 'YES', optionId: option.id })),
	)

	await page.goto('/afspraken')

	const eventLink = page.getByRole('link', { name: new RegExp(event.title) })
	await expect(eventLink).toContainText('1 reactie')
	await eventLink.click()
	await expect(page).toHaveURL(`/afspraak/overzicht/${event.id}`)
})

test('lists an event for a participant', async ({ browser, seedEvent }) => {
	const event = await seedEvent({ authenticateOrganizer: false })
	const respondent = await seedRespondent(
		event.id,
		'Bo',
		event.options.map((option) => ({ availability: 'MAYBE', optionId: option.id })),
	)
	const participant = await newSession(browser, {
		respondent: { eventId: event.id, respondent },
	})

	await participant.page.goto('/afspraken')

	await expect(participant.page.getByRole('link', { name: new RegExp(event.title) })).toContainText(
		'1 reactie',
	)
	await participant.context.close()
})
