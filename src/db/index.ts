import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import { NODE_ENV } from '$env/static/private'
import { env } from '$env/dynamic/private'

const client = postgres(env.DATABASE_URL)
export const db = drizzle({ client, schema, logger: NODE_ENV === 'development' })

export { schema }
