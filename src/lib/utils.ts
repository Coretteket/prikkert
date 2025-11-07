export function keys<const T extends object>(obj: T) {
	return Object.keys(obj) as Array<keyof T>
}

export function deduplicate<T>(array: T[], keyFn: (item: T) => string): T[] {
	const map = new Map<string, T>(array.map((item) => [keyFn(item), item]))
	return Array.from(map.values())
}
