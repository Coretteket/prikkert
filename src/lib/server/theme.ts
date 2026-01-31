import { getRequestEvent } from '$app/server'

import * as v from '@/server/validation'

export const ThemeSchema = v.fallback(v.picklist(['light', 'dark', 'system']), 'system')

export const parseTheme = () => v.parse(ThemeSchema, getRequestEvent().cookies.get('theme'))
