import { drizzle } from 'drizzle-orm/postgres-js'
import { env } from '$env/dynamic/private'
import postgres from 'postgres'

import * as schema from './schema'

const client = postgres(env.DATABASE_URL)

export const db = drizzle({
	client,
	schema,
	logger: env.NODE_ENV === 'development',
	casing: 'snake_case',
})

export { schema }
