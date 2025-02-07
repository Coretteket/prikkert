import { fail as kitFail } from '@sveltejs/kit'
import { PlainDate, PlainTime } from '@/lib/temporal'
import { z } from 'zod'

/** Represents a validation error that occurs during schema validation.
 * Provides a `fail()` method to return form and field errors. */
class ValidationError<TSchema extends z.ZodType> {
	public error: z.typeToFlattenedError<z.output<TSchema>>
	constructor(input: z.SafeParseError<unknown>) {
		this.error = input.error.flatten()
	}

	/** Use `parsed.fail()` to return form and field errors. */
	fail() {
		return kitFail(400, this.error)
	}
}

export const error = ValidationError

/** Use `v.parse()` to validate FormData with a given schema.
 * @returns A Promise that returns `ValidationError` if the data is invalid, otherwise the parsed data.
 * @example
 * ```ts
 * const parsed = await v.parse(request.formData(), Schema)
 * if (parsed instanceof v.error) return parsed.fail()
 * else console.log(parsed)
 * ```
 */
export async function parse<TSchema extends z.ZodType>(
	formData: Promise<FormData>,
	schema: TSchema,
) {
	const parsed = await schema.safeParseAsync(await formData)
	if (parsed.error) return new ValidationError<TSchema>(parsed)
	return parsed.data as z.output<TSchema>
}

/** Use `v.fail()` to return custom form or field errors.
 * @param status The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses), in the range 400-599.
 * @param error The content of the error.
 */
export const fail = <const T extends string | Record<string, string[] | undefined>>(
	status: number,
	error: T,
) =>
	kitFail(
		status,
		(typeof error === 'string'
			? { formErrors: [error], fieldErrors: {} }
			: { formErrors: [], fieldErrors: error }) as {
			formErrors?: string[]
			fieldErrors: Record<string, string[] | undefined>
		},
	)

/** Use `v.plainDate()` to validate a Temporal PlainDate. */
export const plainDate = (message = 'Vul een geldige datum in.') =>
	z.string().transform((value, context) => {
		try {
			return PlainDate.from(value)
		} catch {
			context.addIssue({ code: 'invalid_date', message })
			return z.NEVER
		}
	})

export const plainTime = (message = 'Vul een geldige tijd in.') =>
	z.string().transform((value, context) => {
		try {
			return PlainTime.from(value)
		} catch {
			context.addIssue({ code: 'invalid_date', message })
			return z.NEVER
		}
	})
