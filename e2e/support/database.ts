import { createHash, randomBytes } from 'node:crypto'
import postgres from 'postgres'

const databaseURL = 'postgres://prikkert:prikkert@127.0.0.1:5433/prikkert'
const sql = postgres(databaseURL, { max: 4 })

const COOKIE_PREFIX = 'prikkert_e2e'
const ALPHANUMERIC = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function futureDate(daysFromToday: number) {
	const date = new Date()
	date.setUTCHours(12, 0, 0, 0)
	date.setUTCDate(date.getUTCDate() + daysFromToday)
	return date.toISOString().slice(0, 10)
}

function randomId(length: number) {
	const bytes = randomBytes(length)
	return Array.from(bytes, (byte) => ALPHANUMERIC[byte % ALPHANUMERIC.length]).join('')
}

function hashToken(token: string) {
	return createHash('sha256').update(token).digest('base64')
}

export type SeedEventDetails = {
	allowAnonymous?: boolean
	description?: string
	hideResponses?: boolean
	options?: SeedOption[]
	organizerName?: string
	title?: string
}

export type SeedOption = {
	endsAt?: string
	isSelected?: boolean
	note?: string
	startsAt: string
}

export type SeededEvent = {
	id: string
	options: Array<SeedOption & { id: string }>
	organizerToken: string
	title: string
}

export type SeedResponse = {
	availability: 'YES' | 'MAYBE' | 'NO'
	note?: string
	optionId: string
}

export type SeededRespondent = {
	id: string
	token: string
}

export async function seedEvent(details: SeedEventDetails = {}): Promise<SeededEvent> {
	const id = randomId(16)
	const organizerToken = randomId(21)
	const title = details.title ?? `Teamoverleg ${Date.now()}-${randomId(6)}`
	const options = details.options ?? [{ startsAt: futureDate(30) }, { startsAt: futureDate(31) }]
	const expiresAt = new Date()
	expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1)

	await sql.begin(async (transaction) => {
		await transaction`
			insert into events (
				id, title, organizer_token, organizer_name, description,
				allow_anonymous, hide_responses, expires_at
			) values (
				${id}, ${title}, ${hashToken(organizerToken)}, ${details.organizerName ?? null},
				${details.description ?? null}, ${details.allowAnonymous ?? false},
				${details.hideResponses ?? false}, ${expiresAt}
			)
		`

		for (const option of options) {
			await transaction`
				insert into options (id, event_id, starts_at, ends_at, note, is_selected)
				values (
					${randomId(16)}, ${id}, ${option.startsAt}, ${option.endsAt ?? null},
					${option.note ?? null}, ${option.isSelected ?? false}
				)
			`
		}
	})

	const persistedOptions = await sql<Array<SeedOption & { id: string }>>`
		select id, starts_at as "startsAt", ends_at as "endsAt", note, is_selected as "isSelected"
		from options
		where event_id = ${id}
		order by starts_at
	`

	return { id, options: persistedOptions, organizerToken, title }
}

export async function seedRespondent(
	eventId: string,
	name: string | null,
	responses: SeedResponse[],
): Promise<SeededRespondent> {
	const id = randomId(16)
	const token = randomId(21)

	await sql.begin(async (transaction) => {
		await transaction`
			insert into respondents (id, event_id, token, name)
			values (${id}, ${eventId}, ${hashToken(token)}, ${name})
		`

		for (const response of responses) {
			await transaction`
				insert into responses (option_id, respondent_id, availability, note)
				values (
					${response.optionId}, ${id}, ${response.availability}, ${response.note ?? null}
				)
			`
		}
	})

	return { id, token }
}

export async function removeSeededEvent(eventId: string) {
	await sql`delete from events where id = ${eventId}`
}

export async function getPersistedOptions(eventId: string) {
	return sql<Array<{ endsAt: string | null; startsAt: string }>>`
		select starts_at as "startsAt", ends_at as "endsAt"
		from options
		where event_id = ${eventId}
		order by starts_at
	`
}

export function organizerCookie(event: Pick<SeededEvent, 'id' | 'organizerToken'>) {
	return {
		name: `${COOKIE_PREFIX}_organisator_${event.id}`,
		value: event.organizerToken,
	}
}

export function respondentCookie(eventId: string, respondent: SeededRespondent) {
	return {
		name: `${COOKIE_PREFIX}_deelnemer_${eventId}`,
		value: respondent.id + respondent.token,
	}
}
