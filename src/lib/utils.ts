export function keys<const T extends object>(obj: T) {
	return Object.keys(obj) as Array<keyof T>
}

export function deduplicate<T>(array: T[], keyFn: (item: T) => string): T[] {
	const map = new Map<string, T>(array.map((item) => [keyFn(item), item]))
	return Array.from(map.values())
}

export const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)


export function omit<T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
	const result = { ...obj }
	for (const key of keys) {
		delete result[key]
	}
	return result
}
