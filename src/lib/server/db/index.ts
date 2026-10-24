import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { DATABASE_URL } from '$app/env/private'

import * as schema from './schema.ts'

const client = postgres(DATABASE_URL)

export const db = drizzle({ client, schema, casing: 'snake_case' })

export * as schema from './schema.ts'
