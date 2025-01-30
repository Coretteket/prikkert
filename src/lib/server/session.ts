import { db } from '@/lib/server/db/index'
import * as schema from '@/lib/server/db/schema'
import { generateNanoid } from '@/lib/server/crypto'
import { eq, getTableColumns, sql } from 'drizzle-orm'
import { Duration, Now } from '@/lib/temporal'
import { encodeSHA256 } from '@/lib/server/crypto'
import type { Cookies } from '@sveltejs/kit'

/** The maximum age of a session */
export const MAX_SESSION_AGE = Duration.from({ days: 180 }).round({ largestUnit: 'millisecond' })

/** The maximum remaining life of a session before revalidation */
export const MAX_REVAL_AGE = Duration.from({ days: 150 }).round({ largestUnit: 'millisecond' })

/** Key for the session ID in the prepared session query */
const SESSION_PLACEHOLDER = 'sessionId' as const

/** Client-safe user data columns */
const { passwordHash: _, ...safeUser } = getTableColumns(schema.users)

/** Prepared query to get session and client-safe user from the database with a session ID */
const sessionQuery = db
	.select({ session: schema.sessions, user: safeUser })
	.from(schema.sessions)
	.innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
	.where(eq(schema.sessions.id, sql.placeholder(SESSION_PLACEHOLDER)))
	.limit(1)
	.prepare('session')

/** Get the session and user from the database with a session token,
 * omitting the password hash for client-safe user data. */
export async function getSession(token: string) {
	const result = await sessionQuery
		.execute({ [SESSION_PLACEHOLDER]: await encodeSHA256(token) })
		.then((r) => r.at(0))
	return result ? { ...result.session, user: result.user } : null
}

/** Gets and validates the session from cookies */
export async function validateSession({ cookies }: WithCookies) {
	// Get the encoded session token from cookies
	const token = cookies.get('session')
	if (!token) return null

	// Get the session and user from the database with token
	const session = await getSession(token)
	if (!session) return null

	/// Calculate the remaining life of the session
	const sessionLife = Now.instant().until(session.expiresAt)

	// If the session has expired, delete the session from the database and cookies
	if (Duration.compare(sessionLife, { seconds: 0 }) < 0) {
		await deleteSession({ cookies, sessionId: session.id })
		return null
	}

	// If the session is close to expiring, update the session in the database and cookies
	if (Duration.compare(sessionLife, MAX_REVAL_AGE) < 0) {
		session.expiresAt = Now.instant().add(MAX_SESSION_AGE).toString()

		await db
			.update(schema.sessions)
			.set({ expiresAt: session.expiresAt })
			.where(eq(schema.sessions.id, session.id))

		setSessionCookie({ cookies, token })
	}

	return session
}

/** Securely sets the session cookie based on a token */
function setSessionCookie({ cookies, token }: WithCookies<{ token: string }>) {
	cookies.set('session', token, {
		maxAge: MAX_SESSION_AGE.total('milliseconds'),
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
	})
}

/** Creates a new session and sets session cookie, based on a user ID */
export async function createSession({ cookies, userId }: WithCookies<{ userId: string }>) {
	const token = generateNanoid(21)

	const session = {
		id: await encodeSHA256(token),
		userId,
		expiresAt: Now.instant().add(MAX_SESSION_AGE).toString(),
	}

	await db.insert(schema.sessions).values(session)

	setSessionCookie({ cookies, token })

	return getSession(token)
}

/** Creates a new session for an anonymous user and sets session cookie */
export async function createAnonymousSession({ cookies }: WithCookies) {
	return db.transaction(async (db) => {
		const token = generateNanoid(21)

		const [user] = await db.insert(schema.users).values({}).returning({ id: schema.users.id })

		const session = {
			id: await encodeSHA256(token),
			userId: user.id,
			expiresAt: Now.instant().add(MAX_SESSION_AGE).toString(),
		}

		await db.insert(schema.sessions).values(session)

		setSessionCookie({ cookies, token })

		return getSession(token)
	})
}

/** Deletes the session from the database and cookies, based on cookies or given session ID */
export async function deleteSession({ cookies, sessionId }: WithCookies<{ sessionId?: string }>) {
	if (!sessionId) {
		const token = cookies.get('session')
		if (!token) return
		sessionId = await encodeSHA256(token)
	}

	await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId))

	cookies.delete('session', { path: '/', sameSite: 'strict' })
}

type WithCookies<T = object> = T & { cookies: Cookies }

export type Session = Awaited<ReturnType<typeof getSession>>
