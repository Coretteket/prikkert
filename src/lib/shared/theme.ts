/* eslint-disable unicorn/no-document-cookie --- CookieStore not widely supported yet */

export type Theme = 'light' | 'dark' | 'system'

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
