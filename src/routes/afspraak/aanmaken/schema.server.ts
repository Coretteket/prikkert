import * as v from '@/lib/server/validation'
import { PlainTime } from '@/lib/temporal'

const OptionTimeSchema = v.union(
	[
		v.pipe(
			v.tuple([v.plainTime(), v.nullable(v.plainTime())]),
			v.check(([a, b]) => !b || PlainTime.compare(a, b) < 1, 'Ongeldig tijdslot.'),
		),
		v.pipe(v.array(v.never()), v.length(0)),
	],
	'Ongeldig tijdslot.',
)

export const CreateEventSchema = v.object({
	title: v.pipe(
		v.string('Vul een titel in.'),
		v.minLength(3, 'Vul een titel in van minstens drie tekens.'),
		v.maxLength(200, 'Vul een titel in van maximaal 200 tekens.'),
	),
	description: v.nullable(
		v.pipe(v.string(), v.maxLength(2000, 'Vul een beschrijving in van maximaal 2000 tekens.')),
	),
	options: v.json(
		v.pipe(
			v.array(v.tuple([v.plainDate(), v.array(OptionTimeSchema)])),
			v.minLength(1, 'Vul minstens één datum in.'),
		),
	),
	settings: v.optional(
		v.strictObject(
			{ disallowAnonymous: v.checkbox(), hideParticipants: v.checkbox() },
			'Vul een geldige instelling in.',
		),
	),
})
