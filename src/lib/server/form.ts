import * as v from 'valibot'

export function decodeEntry(
	schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
	value: unknown,
): unknown {
	if (value === null) return undefined
	if (value === '') return null
	if (typeof value !== 'string') return value
	switch (schema.type) {
		case 'bigint': {
			try {
				return BigInt(value)
			} catch {
				return value
			}
		}
		case 'boolean': {
			if (value === 'true') return true
			if (value === 'false') return false
			return value
		}
		case 'date': {
			const number = Number(value)
			if (!isNaN(number)) return new Date(number)
			const date = new Date(value)
			return isNaN(date.getTime()) ? value : date
		}
		case 'number': {
			const number = Number(value)
			return isNaN(number) ? value : number
		}
	}
	return value
}

export function decode<const TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
	context: TSchema & {
		wrapped?: TSchema
	},
	formData: FormData,
	key: string,
): unknown {
	let schema = context
	while (schema.wrapped) {
		schema = schema.wrapped
	}
	switch (schema.type) {
		case 'object': {
			let result: Record<string, unknown> | undefined
			const { entries } = schema as unknown as v.ObjectSchema<v.ObjectEntries, undefined>
			for (const [entryKey, entrySchema] of Object.entries(entries)) {
				const value = decode(entrySchema, formData, key ? `${key}.${entryKey}` : entryKey)
				if (value !== undefined) {
					if (!result) result = {}
					result[entryKey] = value
				}
			}
			return result
		}
		case 'array': {
			let result: unknown[] = []
			const { item } = schema as unknown as v.ArraySchema<TSchema, undefined>
			const entries = formData.getAll(key)
			if (entries.length > 0) {
				result = []
				for (const entry of entries) {
					const value = decodeEntry(item, entry)
					result.push(value)
				}
			} else {
				for (let i = 0; ; i++) {
					const value = decode(item, formData, `${key}.${i}`)
					if (value === undefined) break
					result.push(value)
				}
			}
			return result
		}
		default: {
			return decodeEntry(schema, formData.get(key))
		}
	}
}
