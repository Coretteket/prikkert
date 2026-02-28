/* eslint-disable unicorn/require-module-specifiers */
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: {
				organizer: Map<string, import('./lib/server/session/cookies').OrganizerSession>
				respondent: Map<string, import('./lib/server/session/cookies').RespondentSession>
			}
			theme: 'light' | 'dark' | 'system'
			locale: string
			timezone: string
		}
		interface PageData {
			locale: string
			timezone: string
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
