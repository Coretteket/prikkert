import { locales, type Locale } from '../../locales/data'

export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

export function keys<const T extends object>(object: T) {
	return Object.keys(object) as Array<keyof T>
}

export function deduplicate<T>(array: T[], keyFunction: (item: T) => string): T[] {
	const map = new Map<string, T>(array.map((item) => [keyFunction(item), item]))
	return Array.from(map.values())
}

export const capitalizeFirst = (string_: string) =>
	string_.charAt(0).toUpperCase() + string_.slice(1)

export function omit<T, K extends keyof T>(object: T, ...keys: K[]): Prettify<Omit<T, K>> {
	const result = { ...object }
	for (const key of keys) {
		delete result[key]
	}
	return result
}

/** Use on remote form functions to prevent form reset on submission. */
export const noReset = async ({ submit }: { submit: () => Promise<boolean> }) => {
	await submit()
}

/* @wc-ignore */
export enum KeyType {
	ArrowUp = 'ArrowUp',
	ArrowRight = 'ArrowRight',
	ArrowDown = 'ArrowDown',
	ArrowLeft = 'ArrowLeft',
	Enter = 'Enter',
}

export type Theme = 'light' | 'dark' | 'system'

export const toPreciseLocale = (locale: Locale) =>
	locale === 'en' ? 'en-GB' : locale === 'nl' ? 'nl-NL' : locale

export const isLocale = (value: string): value is Locale => locales.includes(value as Locale)
