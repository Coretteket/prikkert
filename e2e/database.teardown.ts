/// <reference types="node" />

import { test as teardown } from '@playwright/test'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

teardown('stops the test database', async () => {
	await execFileAsync('docker', ['compose', '-f', 'compose.e2e.yml', 'down'])
})
