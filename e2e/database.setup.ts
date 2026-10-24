/// <reference types="node" />

import { test as setup } from '@playwright/test'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const databaseURL = 'postgres://prikkert:prikkert@127.0.0.1:5433/prikkert'

setup('starts the test database', async () => {
	setup.setTimeout(60_000)

	await execFileAsync('docker', ['compose', '-f', 'compose.e2e.yml', 'up', '-d', '--wait'])
	await execFileAsync('pnpm', ['drizzle-kit', 'push'], {
		env: { ...process.env, DATABASE_URL: databaseURL },
	})
})
