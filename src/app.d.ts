// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Map<string, { id: string; token: string }>
			theme: 'light' | 'dark' | 'system'
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
