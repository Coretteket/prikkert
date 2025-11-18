import '@valibot/i18n/nl'

import * as v from 'valibot'

import { PlainDate, PlainTime } from '@/temporal'

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

export * from 'valibot'
