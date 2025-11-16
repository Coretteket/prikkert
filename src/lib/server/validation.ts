import '@valibot/i18n/nl'

import { fail as kitFail } from '@sveltejs/kit'
import * as v from 'valibot'

import { PlainDate, PlainTime } from '../temporal'
import { decode } from './form'

v.setGlobalConfig({ lang: 'nl' })

export const temporal = <T>(
	temporal: { from: (input: string) => T },
	message = 'Vul een geldige datum in.',
) =>
	v.pipe(
		v.string(),
		v.rawTransform((context) => {
			try {
				return temporal.from(context.dataset.value)
			} catch {
				context.addIssue({ message })
				return context.NEVER
			}
		}),
	)

export const plainDate = () => temporal(PlainDate, 'Vul een geldige datum in.')
export const plainTime = () => temporal(PlainTime, 'Vul een geldig tijdstip in.')

export const json = <TSchema extends v.BaseSchema<object, unknown, v.BaseIssue<unknown>>>(
	schema: TSchema,
) => v.pipe(v.string(), v.parseJson(), schema)

export const checkbox = (fallback = false) =>
	v.fallback(
		v.optional(
			v.pipe(
				v.picklist(['on', 'off'], 'Vul een geldige instelling in.'),
				v.transform((v) => v === 'on'),
			),
		),
		fallback,
	)

export class FormError<TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>> {
	constructor(public issues: [v.InferIssue<TSchema>, ...v.InferIssue<TSchema>[]]) {}

	/** Use `parsed.fail()` in a SvelteKit action to return form validation errors. */
	fail() {
		return kitFail(400, { error: v.flatten<TSchema>(this.issues) })
	}
}

export function parseForm<
	const TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(schema: TSchema, formData: FormData, config?: v.Config<v.InferIssue<TSchema>>) {
	const decoded = decode(schema, formData, '')
	const data = schema.type === 'object' ? decoded || {} : decoded
	console.log(data)

	const result = v.safeParse(schema, data, config)
	if (!result.success) return new FormError<TSchema>(result.issues)
	return result.output
}

export * from 'valibot'
