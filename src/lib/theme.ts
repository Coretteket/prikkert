import { browser } from '$app/environment'

export type Theme = 'light' | 'dark' | 'system'

export function setTheme(query: { matches: boolean }) {
	const theme = query.matches ? 'dark' : 'light'
	document.documentElement.classList.add('no-transition')
	document.documentElement.dataset.theme = theme
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	document.documentElement.offsetHeight
	document.documentElement.classList.remove('no-transition')
	return theme
}

export function toggleTheme() {
	const theme = setTheme({ matches: document.documentElement.dataset.theme === 'light' })
	const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	document.cookie = `theme=${theme === systemTheme ? 'system' : theme}; path=/; max-age=31536000`
}

// On load, immediately set the theme based on the system preference.
if (browser && document.documentElement.getAttribute('data-theme') === 'system') {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
	mediaQuery.addEventListener('change', setTheme)
	setTheme(mediaQuery)
}
