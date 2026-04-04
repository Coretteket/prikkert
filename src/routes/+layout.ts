// so that the loaders are registered, only here, not required in nested ones (below)
import '../locales/main.loader.svelte.js'
import '../locales/js.loader.js'

import { loadLocale } from 'wuchale/load-utils'

import { browser } from '$app/environment'

import { isLocale } from '@/shared/utils'

import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async (e) => {
	const locale = e.data.locale
	if (browser && isLocale(locale)) await loadLocale(locale)
	return { locale, timezone: e.data.timezone }
}
