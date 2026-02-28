export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

export function keys<const T extends object>(obj: T) {
	return Object.keys(obj) as Array<keyof T>
}

export function deduplicate<T>(array: T[], keyFn: (item: T) => string): T[] {
	const map = new Map<string, T>(array.map((item) => [keyFn(item), item]))
	return Array.from(map.values())
}

export const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export function omit<T, K extends keyof T>(obj: T, ...keys: K[]): Prettify<Omit<T, K>> {
	const result = { ...obj }
	for (const key of keys) {
		delete result[key]
	}
	return result
}

/** Use on remote form functions to prevent form reset on submission. */
export const noReset = ({ submit }: { submit: () => Promise<void> }) => submit()

/* @wc-ignore */
export enum KeyType {
	ArrowUp = 'ArrowUp',
	ArrowRight = 'ArrowRight',
	ArrowDown = 'ArrowDown',
	ArrowLeft = 'ArrowLeft',
	Enter = 'Enter',
}

export type Theme = 'light' | 'dark' | 'system'
