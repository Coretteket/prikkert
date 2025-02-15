export type Theme = 'light' | 'dark' | 'system'

export function toggleTheme() {
	const currentTheme = document.documentElement.dataset.theme
	const newTheme = currentTheme === 'light' ? 'dark' : 'light'
	document.documentElement.classList.add('no-transition')
	document.documentElement.dataset.theme = newTheme
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	document.documentElement.offsetHeight
	document.documentElement.classList.remove('no-transition')
	const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	document.cookie = `theme=${newTheme === systemTheme ? 'system' : newTheme}; path=/; max-age=31536000`
}
