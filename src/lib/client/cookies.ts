/* eslint-disable unicorn/no-document-cookie --- CookieStore not widely supported yet */

import { goto } from '$app/navigation'
import { page } from '$app/state'

import type { Theme } from '@/shared/utils'

import { getLocaleURL } from '@/shared/url'

export function setTimezone(timezone: string) {
  document.cookie =
    timezone === 'AUTOMATIC'
      ? `timezone=; path=/; max-age=0`
      : `timezone=${timezone}; path=/; max-age=31536000`
}

export function getTimezone() {
  const match = document.cookie.match(/(?:^|; )timezone=([^;]+)/)
  return match ? match[1] : null
}

export function setTheme(theme: Theme) {
  document.documentElement.classList.add('no-transition')
  const systemTheme = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
  document.documentElement.dataset.theme = theme === 'system' ? systemTheme : theme
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  document.documentElement.offsetHeight
  document.documentElement.classList.remove('no-transition')
  document.cookie = `theme=${theme === systemTheme ? 'system' : theme}; path=/; max-age=31536000`
}

export function setLocale(locale: 'nl' | 'en') {
  document.cookie = `locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`
  goto(getLocaleURL(page.url.pathname, locale), {
    invalidateAll: true,
    replaceState: true,
    noScroll: true,
  })
}
