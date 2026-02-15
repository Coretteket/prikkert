import { Temporal } from '@/shared/temporal'
import * as v from '@/server/validation'

export const MAX_NOTE_LENGTH = 75
export const MIN_TITLE_LENGTH = 3
export const MAX_TITLE_LENGTH = 100
export const MAX_DESCRIPTION_LENGTH = 500

export const OptionNoteSchema = v.pipe(
	v.string(),
	v.maxLength(MAX_NOTE_LENGTH, `Vul een opmerking in van maximaal ${MAX_NOTE_LENGTH} tekens.`),
)

export const OptionSlotSchema = v.union(
	[
		v.pipe(
			v.object({
				startsAt: v.plainTime(),
				endsAt: v.optional(v.nullable(v.plainTime())),
				note: v.optional(OptionNoteSchema),
			}),
			v.check(
				(s) => !s.endsAt || Temporal.PlainTime.compare(s.startsAt, s.endsAt) < 1,
				'Vul een starttijd in die eerder is dan de eindtijd.',
			),
		),
		v.object({
			startsAt: v.optional(v.undefined()),
			endsAt: v.optional(v.undefined()),
			note: v.optional(OptionNoteSchema),
		}),
	],
	'Ongeldig tijdslot.',
)

export const OptionSchema = v.object({
	hasTime: v.boolean(),
	slots: v.array(OptionSlotSchema),
})

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
			v.array(v.tuple([v.plainDate(), OptionSchema])),
			v.minLength(1, 'Selecteer minstens 1 datum.'),
		),
	),
	allowAnonymous: v.optional(v.boolean()),
	hideResponses: v.optional(v.boolean()),
})
