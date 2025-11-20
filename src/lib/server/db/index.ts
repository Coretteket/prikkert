import { drizzle } from 'drizzle-orm/postgres-js'
import { env } from '$env/dynamic/private'
import postgres from 'postgres'

import * as schema from './schema'

const client = postgres(env.DATABASE_URL)

export const db = drizzle({ client, schema, casing: 'snake_case' })

export * as schema from './schema'
