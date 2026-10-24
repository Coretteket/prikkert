import { seedRespondent } from './support/database'
import { expect, test } from './support/fixtures'
import { newSession } from './support/sessions'

test('shows response names, availability and notes', async ({ browser, seedEvent }) => {
	const event = await seedEvent({ authenticateOrganizer: false })
	await seedRespondent(event.id, 'Ada', [
		{ availability: 'YES', note: 'Kan de hele dag', optionId: event.options[0].id },
		{ availability: 'NO', optionId: event.options[1].id },
	])
	await seedRespondent(event.id, null, [
		{ availability: 'MAYBE', optionId: event.options[0].id },
		{ availability: 'YES', optionId: event.options[1].id },
	])
	const visitor = await newSession(browser)

	await visitor.page.goto(`/afspraak/overzicht/${event.id}`)
	await visitor.page.getByRole('button', { name: 'Toon alle reacties' }).click()

	await expect(visitor.page.getByText('Ada').first()).toBeVisible()
	await expect(visitor.page.getByText('Anonieme deelnemer').first()).toBeVisible()
	await expect(visitor.page.getByText('Kan de hele dag')).toBeVisible()
	await expect(visitor.page.getByTitle('Ja').first()).toBeVisible()
	await expect(visitor.page.getByTitle('Misschien').first()).toBeVisible()
	await expect(visitor.page.getByTitle('Nee').first()).toBeVisible()
	await visitor.context.close()
})

test('sorts date options by calculated availability', async ({ page, seedEvent }) => {
	const event = await seedEvent()
	await seedRespondent(event.id, 'Eli', [
		{ availability: 'MAYBE', optionId: event.options[0].id },
		{ availability: 'YES', optionId: event.options[1].id },
	])
	await seedRespondent(event.id, 'Fran', [
		{ availability: 'NO', optionId: event.options[0].id },
		{ availability: 'YES', optionId: event.options[1].id },
	])
	await page.goto(`/afspraak/overzicht/${event.id}`)
	const summaries = page.locator('main details summary')
	const betterDateText = await summaries.nth(1).textContent()
	const betterDate = betterDateText?.split('\n', 1)[0] ?? ''

	await page.getByRole('combobox').selectOption('b')

	await expect(summaries.first()).toContainText(betterDate)
	await expect(page).toHaveURL(new RegExp(String.raw`/afspraak/overzicht/${event.id}\?s=b$`))
})
