import { getRequestEvent } from '$app/server'

import { DEFAULT_TIMEZONE } from '#lib/shared/timezone.ts'
import * as v from '#lib/server/validation.ts'

export const ThemeSchema = v.fallback(v.picklist(['light', 'dark', 'system']), 'system')

export const parseTheme = () => v.parse(ThemeSchema, getRequestEvent().cookies.get('theme'))

export const parseTimezone = () => {
	const cookies = getRequestEvent().cookies
	return cookies.get('timezone') || cookies.get('detected_timezone') || DEFAULT_TIMEZONE
}
