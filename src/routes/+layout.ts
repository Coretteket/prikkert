// so that the loaders are registered, only here, not required in nested ones (below)
import '../locales/main.loader.svelte.js'
import '../locales/js.loader.js'

import { loadLocale } from 'wuchale/load-utils'

import { browser } from '$app/env'

import { getTimezone, setDetectedTimezone } from '#lib/client/cookies.ts'
import { detectTimezone } from '#lib/shared/timezone.ts'
import { isLocale } from '#lib/shared/utils.ts'

import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async (event) => {
	const locale = event.data.locale
	if (browser && isLocale(locale)) await loadLocale(locale)

	const isAutomaticTimezone = browser && !getTimezone()
	const timezone = isAutomaticTimezone ? detectTimezone() : event.data.timezone
	if (isAutomaticTimezone) setDetectedTimezone(timezone)

	return { locale, timezone }
}
