import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'
import { NODE_ENV } from '$env/static/private'
import { env } from '$env/dynamic/private'

export const db = drizzle(env.DATABASE_URL, { schema, logger: NODE_ENV === 'development' })

export { schema }
