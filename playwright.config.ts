import { defineConfig, devices } from '@playwright/test'

const databaseURL = 'postgres://prikkert:prikkert@127.0.0.1:5433/prikkert'

export default defineConfig({
	projects: [
		{
			name: 'database setup',
			testMatch: /database\.setup\.ts/,
			teardown: 'database teardown',
		},
		{
			name: 'database teardown',
			testMatch: /database\.teardown\.ts/,
		},
		{
			name: 'chromium',
			testMatch: /.*\.spec\.ts/,
			use: { ...devices['Desktop Chrome'] },
			dependencies: ['database setup'],
		},
	],
	reporter: [['list'], ['html', { open: 'never' }]],
	testDir: 'e2e',
	use: {
		baseURL: 'http://127.0.0.1:4173',
		locale: 'nl-NL',
		screenshot: 'only-on-failure',
		timezoneId: 'Europe/Amsterdam',
		trace: 'retain-on-failure',
	},
	webServer: {
		command: 'pnpm build && pnpm preview --host 127.0.0.1',
		env: {
			COOKIE_PREFIX: 'prikkert_e2e',
			DATABASE_URL: databaseURL,
			PUBLIC_NO_INDEX: '1',
			PUBLIC_ORIGIN: 'http://127.0.0.1:4173',
		},
		url: 'http://127.0.0.1:4173',
	},
})
