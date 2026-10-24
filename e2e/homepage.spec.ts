import { expect, test } from './support/fixtures.ts'
import { futureDate } from './support/database.ts'
import { openMenu } from './support/ui.ts'

async function timezoneCookieValue(page: Parameters<typeof openMenu>[0]) {
	const cookies = await page.context().cookies()
	return cookies.find((cookie) => cookie.name === 'timezone')?.value
}

test('opens the event creation form from the homepage', async ({ page }) => {
	await page.goto('/')
	await page.getByRole('main').getByRole('link', { name: 'Afspraak aanmaken' }).first().click()

	await expect(page).toHaveURL('/afspraak/aanmaken')
	await expect(page.getByRole('heading', { level: 1, name: 'Afspraak aanmaken' })).toBeVisible()
})

test('switches languages without losing the current page', async ({ page }) => {
	await page.goto('/afspraak/aanmaken?bron=nieuwsbrief')

	let menu = await openMenu(page, 'Instellingen')
	await menu.getByText('English').click()
	await expect(page).toHaveURL('/en/event/create?bron=nieuwsbrief')
	await expect(page.getByLabel('Title')).toBeVisible()

	menu = await openMenu(page, 'Settings')
	await menu.getByText('Nederlands').click()
	await expect(page).toHaveURL('/afspraak/aanmaken?bron=nieuwsbrief')
})

test('changes and resets the display time zone', async ({ page, seedEvent }) => {
	const date = futureDate(30)
	const event = await seedEvent({
		options: [
			{
				endsAt: `${date}T10:30:00+00:00[UTC]`,
				startsAt: `${date}T09:00:00+00:00[UTC]`,
			},
		],
	})
	await page.goto(`/afspraak/overzicht/${event.id}`)
	const displayedOption = page.getByRole('time')
	const automaticText = await displayedOption.textContent()

	let menu = await openMenu(page, 'Instellingen')
	await menu.getByText('Tijdzone...').click()
	let dialog = page.getByRole('dialog')
	await dialog.getByRole('combobox').selectOption('Asia/Tokyo')
	await expect.poll(() => timezoneCookieValue(page)).toBe('Asia/Tokyo')
	await expect(displayedOption).not.toHaveText(automaticText ?? '')
	await dialog.getByRole('button', { name: 'Sluiten' }).click()

	menu = await openMenu(page, 'Instellingen')
	await menu.getByText('Tijdzone...').click()
	dialog = page.getByRole('dialog')
	await expect(dialog.getByRole('combobox')).toHaveValue('Asia/Tokyo')
	await dialog.getByRole('combobox').selectOption('AUTOMATIC')
	await expect.poll(() => timezoneCookieValue(page)).toBeUndefined()
	await expect(displayedOption).toHaveText(automaticText ?? '')
})

test('opens the settings menu with the fallback popover', async ({ page }) => {
	await page.addInitScript(() => {
		const supports = CSS.supports.bind(CSS)
		Object.defineProperty(CSS, 'supports', {
			configurable: true,
			value: (property: string, value?: string) =>
				property === 'anchor-name'
					? false
					: value === undefined
						? supports(property)
						: supports(property, value),
		})
	})
	await page.goto('/')

	const menu = await openMenu(page, 'Instellingen')
	await expect(menu.getByText('English')).toBeVisible()
})
