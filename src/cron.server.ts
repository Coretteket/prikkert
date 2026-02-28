import { lt } from 'drizzle-orm'
import { CronJob } from 'cron'

import { DEFAULT_TIMEZONE } from '@/shared/timezone'
import { Temporal } from '@/shared/temporal'
import { db, schema } from '@/server/db'

export const cron = CronJob.from({
	cronTime: '0 5 * * *',
	timeZone: DEFAULT_TIMEZONE,
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
