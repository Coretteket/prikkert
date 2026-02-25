import type { InferSelectModel } from 'drizzle-orm'

import type { schema } from '@/server/db'

import { Temporal } from '@/shared/temporal'
import { TIMEZONE } from '@/shared/utils'

export const getExpiryDate = (
	options: Pick<InferSelectModel<typeof schema.options>, 'startsAt' | 'endsAt'>[],
) => {
	let latestOption = Temporal.Now.plainDateTimeISO() as (typeof options)[number]['startsAt']

	for (const option of options)
		if (Temporal.PlainDateTime.compare(option.endsAt ?? option.startsAt, latestOption) > 0)
			latestOption = option.endsAt ?? option.startsAt

	return latestOption.toZonedDateTime(TIMEZONE).add({ days: 90 }).toInstant().toString()
}

export const getOptionKey = (
	option: Pick<InferSelectModel<typeof schema.options>, 'startsAt' | 'endsAt'>,
) => `${option.startsAt.toString()}:::${option.endsAt?.toString() ?? 'null'}`
