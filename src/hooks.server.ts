import { redirect, type Handle } from '@sveltejs/kit'
import { lt } from 'drizzle-orm'
import { CronJob } from 'cron'

import { building, dev } from '$app/environment'

import { unauthenticated, validateBasicAuth } from '@/server/basic-auth'
import { parseSessionCookies } from '@/server/session/cookies'
import { ID_LENGTH } from '@/server/db/schema'
import { Temporal } from '@/shared/temporal'
import * as v from '@/server/validation'
import { db, schema } from '@/server/db'

export const init = async () => {
	if (dev || building) return

	const timeZone = 'Europe/Amsterdam'

	CronJob.from({
		cronTime: '0 5 * * *',
		timeZone,
		start: true,
		onTick: async () => {
			try {
				const now = Temporal.Now.instant().toString()

				const result = await db
					.delete(schema.events)
					.where(lt(schema.events.expiresAt, now))
					.returning({ id: schema.events.id })

				if (result.length > 0) console.log(`[CRON] Deleted ${result.length} expired events.`)
				else console.log('[CRON] No expired events found.')
			} catch (error) {
				console.error('[CRON] Event cleanup failed:', error)
			}
		},
	})
}

const ThemeSchema = v.fallback(v.picklist(['light', 'dark', 'system']), 'system')

export const handle: Handle = async ({ event, resolve }) => {
	if (!validateBasicAuth()) return unauthenticated()

	const path = event.url.pathname.slice(1)
	if (path.length === ID_LENGTH && !path.includes('/'))
		redirect(dev ? 307 : 308, `/afspraak/reageren/` + path)

	event.locals.session = {
		organizer: parseSessionCookies({ isOrganizer: true }),
		respondent: parseSessionCookies({ isOrganizer: false }),
	}

	event.locals.theme = v.parse(ThemeSchema, event.cookies.get('theme'))

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%sveltekit.theme%', event.locals.theme),
	})
}
