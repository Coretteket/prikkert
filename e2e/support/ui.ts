import { expect, type Page } from '@playwright/test'

export async function openMenu(page: Page, name: string) {
	await page.getByRole('button', { name }).click()

	const menu = page.getByRole('menu')
	await expect(menu).toBeVisible()
	return menu
}
