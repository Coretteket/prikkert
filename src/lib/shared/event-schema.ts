import { Temporal } from '@/shared/temporal'
import * as v from '@/server/validation'

export const OptionTimeSchema = v.union(
	[
		v.pipe(
			v.tuple([v.plainTime(), v.nullable(v.plainTime())]),
			v.check(([a, b]) => !b || Temporal.PlainTime.compare(a, b) < 1, 'Ongeldig tijdslot.'),
		),
		v.pipe(v.array(v.never()), v.length(0)),
	],
	'Ongeldig tijdslot.',
)

export const MIN_TITLE_LENGTH = 3
export const MAX_TITLE_LENGTH = 100
export const MAX_DESCRIPTION_LENGTH = 500

export const EventFormSchema = v.strictObject({
	id: v.optional(v.union([v.literal(0), v.string()])), // 0 for create (workaround), string for edit
	title: v.pipe(
		v.string('Vul een titel in.'),
		v.minLength(MIN_TITLE_LENGTH, `Vul een titel in van minstens ${MIN_TITLE_LENGTH} tekens.`),
		v.maxLength(MAX_TITLE_LENGTH, `Vul een titel in van maximaal ${MAX_TITLE_LENGTH} tekens.`),
	),
	description: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(
				MAX_DESCRIPTION_LENGTH,
				`Vul een beschrijving in van maximaal ${MAX_DESCRIPTION_LENGTH} tekens.`,
			),
			v.transform((val) => (val.length > 0 ? val : undefined)),
		),
		'',
	),
	organizerName: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(MAX_TITLE_LENGTH, `Vul een naam in van maximaal ${MAX_TITLE_LENGTH} tekens.`),
			v.transform((val) => (val.length > 0 ? val : undefined)),
		),
	),
	options: v.json(
		v.pipe(
			v.array(v.tuple([v.plainDate(), v.array(OptionTimeSchema)])),
			v.minLength(1, 'Selecteer minstens 1 datum.'),
		),
	),
	allowAnonymous: v.optional(v.boolean()),
	hideResponses: v.optional(v.boolean()),
})

// Expires 90 days after the latest date option
export const getExpiryDate = (
	options: {
		startsAt: Temporal.PlainDate | Temporal.PlainDateTime
		endsAt: Temporal.PlainDateTime | undefined
	}[],
) => {
	let latestOption = Temporal.Now.plainDateTimeISO() as (typeof options)[number]['startsAt']

	for (const option of options)
		if (Temporal.PlainDateTime.compare(option.endsAt ?? option.startsAt, latestOption) > 0)
			latestOption = option.endsAt ?? option.startsAt

	return latestOption.toZonedDateTime('Europe/Amsterdam').add({ days: 90 }).toInstant().toString()
}
