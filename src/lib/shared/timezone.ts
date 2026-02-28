import { page } from '$app/state'

import { Temporal } from '@/shared/temporal'

/* @wc-ignore */
export const DEFAULT_TIMEZONE = 'Europe/Amsterdam'

export function detectTimezone() {
	return Temporal.Now.timeZoneId()
}

export function formatTimezoneID(timezone: string) {
	return timezone.replaceAll('/', ', ').replaceAll('_', ' ')
}

export function formatTimezoneName(timezone: string, locale: string) {
	return (
		new Intl.DateTimeFormat(locale, { timeZone: timezone, timeZoneName: 'longGeneric' })
			.formatToParts()
			.find((part) => part.type === 'timeZoneName')?.value ?? formatTimezoneID(timezone)
	)
}

export function hasSameOffset(a: string, b: string) {
	const now = Temporal.Now.instant()
	return now.toZonedDateTimeISO(a).offset === now.toZonedDateTimeISO(b).offset
}

export const toUserTimezone = (value: Temporal.ZonedDateTime | Temporal.PlainDate) =>
	value instanceof Temporal.ZonedDateTime ? value.withTimeZone(page.data.timezone) : value
