import { getRequestEvent } from '$app/server'

import * as v from '#lib/server/validation.ts'

export const ThemeSchema = v.fallback(v.picklist(['light', 'dark', 'system']), 'system')

export const parseTheme = () => v.parse(ThemeSchema, getRequestEvent().cookies.get('theme'))
