// so that the loaders are registered, only here, not required in nested ones (below)
import '../locales/main.loader.svelte.js'
import '../locales/js.loader.js'

import { loadLocale } from 'wuchale/load-utils'

import { browser } from '$app/environment'

import type { LayoutLoad } from './$types'

import { locales } from '../locales/data'

export const load: LayoutLoad = async (e) => {
	const locale = e.data.locale
	if (browser && locales.includes(locale)) await loadLocale(locale)
	return { locale }
}
