<script lang="ts">
	import { onMount } from 'svelte'

	import { goto } from '$app/navigation'

	import Dialog from '#lib/components/dialog.svelte'
	import Button from '#lib/components/button.svelte'

	import { validateOrganizerShareLink } from './action.remote.ts'

	let { id, isOrganizer }: { id: string; isOrganizer: boolean } = $props()

	let token: string | undefined = $state()
	const receiveForm = $derived(validateOrganizerShareLink.for(id))

	onMount(async () => {
		const hash = new URLSearchParams(location.hash.slice(1))
		if (!hash.has('organisator')) return
		// navigate to remove hash from url
		await goto(location.pathname, { replace: true, reset: false })
		if (isOrganizer) return
		token = hash.get('organisator') ?? undefined
	})
</script>

<Dialog open={token !== undefined}>
	<form
		{...receiveForm.enhance(async ({ submit }) => {
			await submit()
			await goto(`/afspraak/overzicht/${id}`, { replace: true, reset: false })
			token = undefined
		})}
	>
		<input {...receiveForm.fields.token.as('hidden', token ?? '')} />

		<p class="mb-4 text-lg font-medium">Afspraakbeheerder worden</p>
		<p class="mb-6 text-neutral-700 dark:text-neutral-300">
			Als je doorgaat word je mede-beheerder van deze afspraak. Je kunt de afspraak dan bijvoorbeeld
			bewerken of verwijderen.
		</p>

		<div class="flex justify-end gap-3">
			<Button formmethod="dialog" variant="secondary">Annuleren</Button>
			<Button variant="primary">Bevestigen</Button>
		</div>
	</form>
</Dialog>
