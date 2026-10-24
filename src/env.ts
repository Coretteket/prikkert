import { defineEnvVars } from '@sveltejs/kit/env'

const required = (name: string) => (input: string | undefined) => {
	if (!input) throw new Error(`${name} is required`)
	return input
}

export const variables = defineEnvVars({
	PUBLIC_NO_INDEX: { public: true, schema: (input = '') => input },
	PUBLIC_ORIGIN: { public: true, schema: required('PUBLIC_ORIGIN') },
	COOKIE_PREFIX: { schema: required('COOKIE_PREFIX') },
	DATABASE_URL: { schema: required('DATABASE_URL') },
})
